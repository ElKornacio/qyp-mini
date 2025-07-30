import { makeObservable, observable } from 'mobx';
import * as React from 'react';

export class ErrorBoundary extends React.Component<{
	fallback: (error: any) => React.ReactNode;
	children: React.ReactNode;
}> {
	@observable error = null;

	constructor(props: any) {
		super(props);

		makeObservable(this);
	}

	componentDidCatch(error: any, _info: any) {
		this.error = error;
	}

	render() {
		if (this.error) {
			// You can render any custom fallback UI
			return this.props.fallback(this.error);
		}

		return this.props.children;
	}
}
