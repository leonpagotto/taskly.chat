export type SubscriptionPlan = 'free' | 'lifetime' | 'premium' | 'enterprise';

export type SubscriptionLimits = {
	storiesFeature: boolean;
	stories: number; // max stories allowed
};

export type SubscriptionInfo = {
	plan: SubscriptionPlan;
	limits: SubscriptionLimits;
};

// Simple local-storage backed subscription info. Defaults to 'enterprise' for full access.
const getStoredPlan = (): SubscriptionPlan => {
	try {
		const plan = (typeof localStorage !== 'undefined' ? localStorage.getItem('subscription_plan') : null) as SubscriptionPlan | null;
		return plan || 'enterprise';
	} catch {
		return 'enterprise';
	}
};

export const subscriptionService = {
	getSubscriptionInfo(): SubscriptionInfo {
		const plan = getStoredPlan();
		const limits: SubscriptionLimits = {
			storiesFeature: plan === 'enterprise' || plan === 'premium' || plan === 'lifetime',
			stories: plan === 'enterprise' ? 1000 : plan === 'premium' || plan === 'lifetime' ? 100 : 0,
		};
		return { plan, limits };
	},
};

export default subscriptionService;
