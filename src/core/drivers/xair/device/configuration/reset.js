// Exported
export const reset = e => () => {
    e.audio.clockRate.set(0);
    e.audio.safeLevel.set(false);
    e.audio.linkPreamps.set(true);
    e.audio.linkEqualizers.set(true);
    e.audio.linkDynamics.set(true);
    e.audio.linkLevelsMute.set(true);
    e.audio.hardMutes.set(false);
    e.audio.dcaGroups.set(true);
    e.audio.usbInterface.set(0);

    e.midi.dinRx.set(false);
    e.midi.dinTx.set(true);
    e.midi.dinXOsc.set(true);
    e.midi.usbRx.set(false);
    e.midi.usbTx.set(false);
    e.midi.usbOsc.set(false);
    e.midi.usbPassThrough.set(true);
};
