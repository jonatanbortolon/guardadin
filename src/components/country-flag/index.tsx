import type { Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

type Props = {
	country: Country;
};

export function CountryFlag({ country }: Props) {
	const Flag = flags[country];

	if (!Flag) {
		return null;
	}

	return (
		<span className="flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] [&_svg]:size-full">
			<Flag title={country} />
		</span>
	);
}
