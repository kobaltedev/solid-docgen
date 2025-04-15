interface MyInterface {
	a: "A";
	b?: "B";
}

interface Props {
	myProp: MyInterface;
}

export function MyComp(props: Props) {
	return <></>;
}
