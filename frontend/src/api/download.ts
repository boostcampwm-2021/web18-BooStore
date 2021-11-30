export const downloadFiles = (query: string) => {
	return fetch(`/cloud/download?${query}`, {
		credentials: 'include',
	})
		.then((res) => {
			if (res.ok) {
				return res;
			} else if (res.status === 401) {
				throw new Error('올바른 사용자가 아닙니다. 로그인 후 사용해주십시오.');
			} else {
				throw new Error('올바른 요청이 아닙니다.');
			}
		})
		.then(async (res) => {
			const fileName = /attachment; filename="(?<fileName>[^"]+)"/.exec(
				res.headers.get('Content-Disposition') as string
			)?.groups?.fileName;
			const blob = await res.blob();
			return { fileName: fileName, blob: blob };
		})
		.then(({ fileName, blob }) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName as string;
			document.body.appendChild(a);
			a.click();
			a.remove();
		})
		.catch((err) => {
			throw new Error(err.message);
		});
};
