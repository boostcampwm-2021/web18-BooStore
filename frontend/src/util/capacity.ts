interface convertByteFunction {
	(byte: number): number;
};

export const convertByteToKB: convertByteFunction = (byte) => {
	return byte / 1024;
}

export const convertByteToMB: convertByteFunction = (byte) => {
	return byte / (1024 * 1024);
}

export const convertByteToGB: convertByteFunction = (byte) => {
	return byte / (1024 * 1024 * 1024);
}