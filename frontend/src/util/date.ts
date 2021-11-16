
export const getDate = (fullDate: string) => {
	const dateObj = new Date(fullDate);
	
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth().toString().padStart(2, '0');
	const date = dateObj.getDate().toString().padStart(2, '0');
	
	return `${year}년 ${month}월 ${date}일`;
};