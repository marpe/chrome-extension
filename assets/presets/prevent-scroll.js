(() => {
	// Lock scrollTop by overriding the setter
	Object.defineProperty(document.documentElement, "scrollTop", {
		set: (value) => {
			console.log("Prevented scrollTop from being set to:", value);
			return 0; // Force scrollTop to remain 0
		},
		get: () => {
			return 0; // Always return 0
		},
		configurable: false,
	});
})();
