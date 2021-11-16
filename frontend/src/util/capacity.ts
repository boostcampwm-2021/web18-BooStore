const KB = Math.pow(1024, 1);
const MB = Math.pow(1024, 2);
const GB = Math.pow(1024, 3);

interface convertByteFunction {
	(byte: number): number;
};

export const convertByteToKB: convertByteFunction = (byte) => {
	return byte / KB;
}

export const convertByteToMB: convertByteFunction = (byte) => {
	return byte / MB;
}

export const convertByteToGB: convertByteFunction = (byte) => {
	return byte / GB;
}

export const convertByteToUnitString = (byte: number) => {
	if (byte < MB) {
		return `${parseFloat(convertByteToKB(byte).toFixed(1))}KB`;
	} else if (byte < GB) {
		return `${parseFloat(convertByteToMB(byte).toFixed(1))}MB`;
	}
	return `${parseFloat(convertByteToGB(byte).toFixed(1))}GB`;
};