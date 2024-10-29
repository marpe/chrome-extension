window.scrollBlock = () => {
	Object.defineProperty(document.documentElement, "scrollTop", {
		set: (value) => {
			console.log("Prevented scrollTop from being set to:", value);
			return 0;
		},
		get: () => {
			return 0;
		},
		configurable: false,
	});
};

setTimeout(() => {
	console.log("Preventing scrolling...");
	window.scrollBlock();
}, 1000);
