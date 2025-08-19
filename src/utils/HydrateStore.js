export function hydrateStoreFromLocalStorage(store, storage) {
  const user = storage.get("auth_user");

  if (user) {
    store.setState({
      isAuthenticated: true,
      role: user.role,
      user: user,
    });
  }
}
