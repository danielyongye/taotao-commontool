const STORAGE_KEY = 'WISH_LIST';

export function getWishList() {
  const data = uni.getStorageSync(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
export function setWishList(list) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list));
}
export function addWishes(newWishes) {
  const old = getWishList();
  // 去重合并
  const merged = [...old];
  newWishes.forEach(w => {
    if (!old.some(item => item.id === w.id)) merged.push(w);
  });
  setWishList(merged);
}
export function removeWish(id) {
  const old = getWishList();
  setWishList(old.filter(w => w.id !== id));
} 