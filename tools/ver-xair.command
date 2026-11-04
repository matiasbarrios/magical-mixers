#!/bin/bash
# Diagnostic for X Air / M Air consoles.
# Sends /xinfo over UDP to port 10024 and prints the raw reply.
# Installs nothing: uses the perl that already ships with macOS.
# In Terminal: bash ver-xair.command
echo
echo "Looks for the console on the network and shows what it replies."
echo "Installs nothing. Takes about 20 seconds."
echo "If macOS shows a firewall prompt, click Allow."
echo
/usr/bin/perl -x "$0"
echo
echo "============================================================"
echo "Copy ALL the text in this window and send it."
echo "============================================================"
read -r -p "Press Enter to close... "
exit

#!perl
use strict;
use IO::Select;
use IO::Socket::INET;
use Socket qw(inet_aton inet_ntoa pack_sockaddr_in sockaddr_in SO_BROADCAST);

$| = 1;

my $PORT = 10024;
my $SECONDS = 20;

# /xinfo without arguments. Same bytes the library sends.
my $xinfo = pack('H*', '2f78696e666f00002c000000');

my $host = `scutil --get ComputerName 2>/dev/null`;
chomp $host;
if ($host eq '') {
    $host = `hostname`;
    chomp $host;
}
my $os = `sw_vers -productVersion 2>/dev/null`;
chomp $os;
print "Computer: $host\n";
print "macOS: $os\n\n";

my @targets;
my $iface = '';
my $up = 0;
open my $ifconfig, '-|', '/sbin/ifconfig', '-a' or die "Could not read the networks: $!\n";
while (<$ifconfig>) {
    if (/^(\S+): flags=\d+<([^>]*)>/) {
        $iface = $1;
        $up = ($2 =~ /\bUP\b/) ? 1 : 0;
        next;
    }
    next unless $up;
    next unless /^\s+inet (\d+\.\d+\.\d+\.\d+)/;
    my $ip = $1;
    next if $ip =~ /^127\./;
    my $broadcast = '';
    $broadcast = $1 if /broadcast (\d+\.\d+\.\d+\.\d+)/;
    push @targets, {
        name => $iface,
        local => $ip,
        broadcast => $broadcast,
    };
}
close $ifconfig;

if (!@targets) {
    @targets = ({
        name => 'all',
        local => '0.0.0.0',
        broadcast => '255.255.255.255',
    });
}

print "Networks:\n";
for my $target (@targets) {
    my $broadcast = $target->{broadcast} eq '' ? '(none)' : $target->{broadcast};
    print "  $target->{name}\n";
    print "    this computer: $target->{local}\n";
    print "    broadcast:  $broadcast\n";
}
print "\n";
print "Sending /xinfo to port $PORT for $SECONDS seconds...\n\n";

my @sockets;
for my $target (@targets) {
    my $socket = IO::Socket::INET->new(
        Proto => 'udp',
        LocalAddr => $target->{local},
        LocalPort => 0,
        Broadcast => 1,
        ReuseAddr => 1,
    );
    if (!$socket) {
        print "Could not open network $target->{local}: $!\n";
        next;
    }
    $socket->sockopt(SO_BROADCAST, 1);
    push @sockets, { socket => $socket, target => $target };
}

if (!@sockets) {
    print "Could not open any network. Nothing to show.\n";
    exit 0;
}

sub show_packet {
    my ($ip, $port, $buf) = @_;
    print "----- reply -----\n";
    print "from $ip:$port   " . length($buf) . " bytes\n";
    my @strings;
    my $current = '';
    for my $byte (unpack('C*', $buf)) {
        if ($byte == 0) {
            if (length $current) {
                push @strings, $current;
                $current = '';
            }
        } elsif ($byte >= 32 && $byte <= 126) {
            $current .= chr($byte);
        } else {
            $current .= sprintf('\\x%02X', $byte);
        }
    }
    push @strings, $current if length $current;
    for my $i (0 .. $#strings) {
        my $text = $strings[$i];
        print "  [$i] '$text'  length=" . length($text) . "\n";
    }
    my $hex = join ' ', map { sprintf('%02X', $_) } unpack('C*', $buf);
    print "hex: $hex\n\n";
}

my %seen;
my %announced;
my $select = IO::Select->new(map { $_->{socket} } @sockets);
my $end = time + $SECONDS;
my $next_send = 0;
my $last_tick = 0;

while (time < $end) {
    if (time >= $next_send) {
        for my $entry (@sockets) {
            my $socket = $entry->{socket};
            my $target = $entry->{target};
            # macOS rejects 255.255.255.255 from a socket bound to one interface.
            # The subnet broadcast is the packet the desk actually receives.
            my @destinations = $target->{broadcast} ne ''
                ? ($target->{broadcast})
                : ('255.255.255.255');
            for my $dest (@destinations) {
                my $announce_key = "$target->{local}|$dest";
                my $addr = inet_aton($dest);
                if (!$addr) {
                    if (!$announced{$announce_key}) {
                        print "error sending to $dest from $target->{local}: invalid address\n";
                        $announced{$announce_key} = 1;
                    }
                    next;
                }
                my $sent = $socket->send($xinfo, 0, pack_sockaddr_in($PORT, $addr));
                if (!defined $sent) {
                    if (!$announced{$announce_key}) {
                        print "error sending to $dest from $target->{local}: $!\n";
                        $announced{$announce_key} = 1;
                    }
                } elsif (!$announced{$announce_key}) {
                    print "sent /xinfo to $dest:$PORT from $target->{local}\n";
                    $announced{$announce_key} = 1;
                }
            }
        }
        $next_send = time + 2;
    }

    if (time - $last_tick >= 5) {
        my $left = $end - time;
        $left = 0 if $left < 0;
        print "still looking... ${left}s\n";
        $last_tick = time;
    }

    my $slice = $next_send - time;
    $slice = 0.2 if $slice > 0.2 || $slice < 0;
    my $remain = $end - time;
    $slice = $remain if $remain < $slice;
    my @ready = $select->can_read($slice);
    for my $socket (@ready) {
        my $buf = '';
        my $peer = $socket->recv($buf, 65535, 0);
        next unless defined $peer && length $buf;
        next if $buf eq $xinfo;
        my ($remote_port, $remote_addr) = sockaddr_in($peer);
        my $remote_ip = inet_ntoa($remote_addr);
        my $hex_key = unpack('H*', $buf);
        my $key = "$remote_ip|$hex_key";
        next if $seen{$key};
        $seen{$key} = 1;
        show_packet($remote_ip, $remote_port, $buf);
    }
}

for my $entry (@sockets) {
    close $entry->{socket};
}

print "\n";
my $count = scalar keys %seen;
if ($count == 0) {
    print "No reply arrived.\n";
    print "Check this and run the file again:\n";
    print "  - the computer has to be on the same network as the console\n";
    print "  - the console has to be powered on\n";
    print "  - if a firewall prompt appeared, choose Allow and run it again\n";
} else {
    print "Done. $count reply(ies) arrived.\n";
    print "Copy all the text in this window and send it.\n";
}
