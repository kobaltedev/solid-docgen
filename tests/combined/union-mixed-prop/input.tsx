interface Props {
	myProp: "A" | undefined | "C" | "B" | null | 4 | false | (string & {});
}

export function MyComp(props: Props) {
	return <></>;
}
