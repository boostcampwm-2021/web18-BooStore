import { throttle } from '@util/throttle';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

/*
 * selector: 선택 대상의 query selector
 * addSelected: 선택 대상이 포함되면 실행되는 함수
 * removeSelect: 선택 대상이 포함되지않은 경우 실행되는 함수
 * scrollFrame: 만약 스크롤이 적용된 경우, 스크롤이 실행되는 엘리먼트
 */
interface SelectionProps {
	selector: string;
	addSelcted: (id: string) => void;
	removeSelected: (id: string) => void;
	scrollFrame?: HTMLElement;
}
interface OffsetPosition {
	ltX: number;
	ltY: number;
	rbX: number;
	rbY: number;
}

const Selection: React.FC<SelectionProps> = ({
	children,
	selector,
	addSelcted,
	removeSelected,
	scrollFrame,
}) => {
	const [point, setPoint] = useState({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	});
	const [isDraging, setDraging] = useState(false);
	const container = useRef<HTMLDivElement>(null);

	const getElements = () => container.current?.querySelectorAll(selector);
	const getOffsetPosition = (
		offsetLeft: number,
		offsetTop: number,
		pageX: number,
		pageY: number
	) => {
		return {
			offsetX: pageX - offsetLeft + (scrollFrame?.scrollLeft ?? 0),
			offsetY: pageY - offsetTop + (scrollFrame?.scrollTop ?? 0),
		};
	};

	const onStartDrag = (event: MouseEvent) => {
		if (!container.current || !container.current.contains(event.target as Element)) {
			return;
		}
		const { pageX, pageY } = event;
		const { offsetLeft, offsetTop } = container.current;
		let { offsetX, offsetY } = getOffsetPosition(offsetLeft, offsetTop, pageX, pageY);

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

	const throttledChangeBox = throttle(
		(
			pageX: number,
			pageY: number,
			offsetLeft: number,
			offsetTop: number,
			offsetWidth: number,
			offsetHeight: number
		) => {
			let { offsetX, offsetY } = getOffsetPosition(offsetLeft, offsetTop, pageX, pageY);
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
				ltX: Math.min(point.startX, offsetX),
				ltY: Math.min(point.startY, offsetY),
				rbX: Math.max(point.startX, offsetX),
				rbY: Math.max(point.startY, offsetY),
			});
		},
		5
	);

	const onChangeBox = useCallback(
		(event: MouseEvent) => {
			if (!container.current || !isDraging) {
				return;
			}
			const { pageX, pageY } = event;
			const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = container.current;

			throttledChangeBox(pageX, pageY, offsetLeft, offsetTop, offsetWidth, offsetHeight);
		},
		[isDraging]
	);
	const selectRange = ({ ltY, ltX, rbY, rbX }: OffsetPosition) => {
		const fileElements = getElements();

		fileElements?.forEach((tmp) => {
			const ele = tmp as HTMLElement;

			const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = ele;
			if (
				offsetTop > rbY ||
				offsetTop + offsetHeight < ltY ||
				offsetLeft > rbX ||
				offsetLeft + offsetWidth < ltX
			) {
				return removeSelected(ele.dataset.id!);
			}

			addSelcted(ele.dataset.id!);
		});
	};

	useEffect(() => {
		window.addEventListener('mousemove', onChangeBox);

		return () => {
			window.removeEventListener('mousemove', onChangeBox);
		};
	}, [isDraging]);

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
		zIndex: 2,
	},
}))<OffsetPosition>`
	position: absolute;

	background-color: rgba(155, 193, 239, 0.4);
`;

export default Selection;
