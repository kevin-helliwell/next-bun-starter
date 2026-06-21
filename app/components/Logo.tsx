import React from 'react';
import Link from 'next/link';

const Logo = () => {
	return (
		<Link
			href="/"
			data-testid="logo-link"
			className="btn btn-link text-xl no-underline hover:no-underline px-2 normal-case"
		>
			<span className="text-primary font-outfit text-xl font-semibold">My App</span>
		</Link>
	);
};

export default Logo;
