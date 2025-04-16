interface Props {
	myProp: "A" | undefined | "C" | "B" | null | 4 | false;
}

export function MyComp(props: Props) {
	return <></>;
}
