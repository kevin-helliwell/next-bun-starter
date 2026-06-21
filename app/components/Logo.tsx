import React from 'react';
import Link from 'next/link';

const Logo = () => {
	return (
		<Link
			href="/"
			data-testid="logo-link"
			className="btn btn-link text-xl no-underline hover:no-underline flex flex-col items-center whitespace-nowrap"
		>
			<span className="text-primary font-outback text-3xl sm:text-4xl">My App</span>
		</Link>
	);
};

export default Logo;
