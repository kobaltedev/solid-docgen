interface Props {
	/**
	 * This is myProp.
	 */
	myProp?: "A";
	secondProp: "B";
	/**
	 * Description of another.
	 *
	 * @default "C"
	 */
	another: "C" | "D" | undefined;
	/**
	 * @default 4
	 */
	lastone?: 4 | 5;
}

export function MyComp(props: Props) {
	return <></>;
}
