export const sol = `CHIP Computer {
    IN reset;

    PARTS:
    CPU(
        reset=reset,
        inM=outM,
        instruction=instruction,
        outM=inM,
        writeM=writeM,
        addressM=addressM,
        pc=pc
    );

    // ROM
    ROM32K(
        address=pc,
        out=instruction
    );

    // RAM
    Memory(
        in=inM,
        load=writeM,
        address=addressM,
        out=outM
    );
}`;
