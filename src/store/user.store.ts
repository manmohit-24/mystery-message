// store/userStore.ts
import { create } from "zustand";

interface UserState {
	user: {
		_id: string;
		name?: string;
		username?: string;
		email?: string;
		avatar?: string;
		isAcceptingMessage?: boolean;
	} | null;
	setUser: (user: {
		_id: string;
		name?: string;
		username?: string;
		email?: string;
		avatar?: string;
		isAcceptingMessage?: boolean;
	}) => void;
	isLoadingUser: boolean;
	setIsLoadingUser: (isLoading: boolean) => void;
	clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	isLoadingUser: true,
	setIsLoadingUser: (isLoading) => set({ isLoadingUser: isLoading }),
	clearUser: () => set({ user: null }),
}));
