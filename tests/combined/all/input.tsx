interface Props {
	/**
	 * This is a.
	 */
	a: string;
	/**
	 * Description of b.
	 *
	 * @default 4
	 */
	b?: number;
	c: undefined;
	d: null;
	e: void;
	f: unknown;
	g: boolean;
	h: "A";
	i: 4;
	j: "A" | 4;
	k?: "A" | 4;
	l: "A" | 4 | undefined;
	m: string & {};
	n: string[];
	o: Array<string>;
	p: (number | string)[];
	q: Array<number | string>;
	r: () => void;
	s: (a: string) => string;
	t: (a: number, ...b: string[]) => {a: "A", b: number | string};
	u: {a: "A", b?: 4, c: "A" | string | undefined};

	/**
	 * @internal
	 */
	internal: "hidden";
}

export function MyComp(props: Props) {
	return <></>;
}
