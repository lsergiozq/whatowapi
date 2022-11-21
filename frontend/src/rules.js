const rules = {
	user: {
		static: [],
	},

	admin: {
		static: [
			"drawer-admin-items:view",
			"user-modal:editProfile",
		],
	},
};

export default rules;
