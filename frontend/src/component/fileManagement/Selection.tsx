import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

interface SelectionProps {
	addSelcted: (id: string) => void;
	removeSelect: (id: string) => void;
}
interface OffsetPosition {
	ltX: number;
	ltY: number;
	rbX: number;
	rbY: number;
}

const Selection: React.FC<SelectionProps> = ({ children, addSelcted, removeSelect }) => {
	const [point, setPoint] = useState({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});
	const [isDraging, setDraging] = useState(false);
	const container = useRef<HTMLDivElement>(null);

	const getFileElements = () => container.current?.querySelectorAll('.file');
	const getOffsetPosition = (target: HTMLDivElement, pageX: number, pageY: number) => {
		return {
			offsetX: pageX - target.offsetLeft,
			offsetY: pageY - target.offsetTop,
		};
	};

	const onStartDrag = (event: MouseEvent) => {
		if (!container.current || !container.current.contains(event.target as Element)) {
			return;
		}
		const { pageX, pageY } = event;
		const { offsetX, offsetY } = getOffsetPosition(container.current, pageX, pageY);

		setPoint({
			startX: offsetX,
			startY: offsetY,
			endX: offsetX,
			endY: offsetY,
		});
		setDraging(true);
	};
	const onEndDrag = (event: MouseEvent) => {
		setDraging(false);
	};
	const onChangeBox = useCallback(
		(event: MouseEvent) => {
			if (!container.current || !isDraging) {
				return;
			}
			const { pageX, pageY } = event;
			const { offsetWidth, offsetHeight } = container.current;
			let { offsetX, offsetY } = getOffsetPosition(container.current, pageX, pageY);
			if (offsetX < 0) {
				offsetX = 0;
			} else if (offsetX > offsetWidth) {
				offsetX = offsetWidth;
			}
			if (offsetY < 0) {
				offsetY = 0;
			} else if (offsetY > offsetHeight) {
				offsetY = offsetHeight;
			}

			setPoint((prev) => ({ ...prev, endX: offsetX, endY: offsetY }));

			selectRange({
				ltX: Math.min(point.startX, point.endX),
				ltY: Math.min(point.startY, point.endY),
				rbX: Math.max(point.startX, point.endX),
				rbY: Math.max(point.startY, point.endY),
			});
		},
		[isDraging, children, point]
	);
	const selectRange = ({ ltY, ltX, rbY, rbX }: OffsetPosition) => {
		const fileElements = getFileElements();

		fileElements?.forEach((tmp) => {
			const ele = tmp as HTMLElement;

			const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = ele;
			if (
				offsetTop > rbY ||
				offsetTop + offsetHeight < ltY ||
				offsetLeft > rbX ||
				offsetLeft + offsetWidth < ltX
			) {
				return removeSelect(ele.dataset.id!);
			}

			addSelcted(ele.dataset.id!);
		});
	};

	useEffect(() => {
		window.addEventListener('mousemove', onChangeBox);

		return () => {
			window.removeEventListener('mousemove', onChangeBox);
		};
	}, [isDraging, children, point]);

	useEffect(() => {
		window.addEventListener('mousedown', onStartDrag);
		window.addEventListener('mouseup', onEndDrag);

		return () => {
			window.removeEventListener('mousedown', onStartDrag);
			window.removeEventListener('mouseup', onEndDrag);
		};
	}, []);

	return (
		<SelectionContainer ref={container}>
			{isDraging && (
				<DragBox
					ltX={Math.min(point.startX, point.endX)}
					ltY={Math.min(point.startY, point.endY)}
					rbX={Math.max(point.startX, point.endX)}
					rbY={Math.max(point.startY, point.endY)}
				/>
			)}
			{children}
		</SelectionContainer>
	);
};
const SelectionContainer = styled.div`
	position: relative;
	height: 100%;
`;
const DragBox = styled.div.attrs<OffsetPosition>(({ ltY, ltX, rbY, rbX }) => ({
	style: {
		top: `${ltY}px`,
		left: `${ltX}px`,
		width: `${rbX - ltX}px`,
		height: `${rbY - ltY}px`,
		zIndex: 99,
	},
}))<OffsetPosition>`
	position: absolute;

	background-color: rgba(155, 193, 239, 0.4);
`;

export default Selection;
