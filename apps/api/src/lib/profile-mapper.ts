import type {
  Profile as AlgoProfile,
  GiftCategory,
  BigFive,
} from '@prsnt/algorithm';
import { VALID_CATEGORIES } from '@prsnt/algorithm';

type DbProfile = {
  userId: string;
  birthday: string | null;
  partyStyle: string | null;
  favoriteColor: string | null;
  giftCategoriesLiked: string[];
  giftCategoriesDisliked: string[];
  hobbies: string[];
  wontBuySelf: string[];
  underTenItems: string[];
  wishList: string[];
  giftCardStores: string[];
  secretWish: string | null;
  sizes: Record<string, string>;
  doNotGift: string[];
  bigFive: BigFive | null;
};

const VALID_CATEGORY_SET = new Set<string>(VALID_CATEGORIES);

function asCategories(values: string[]): GiftCategory[] {
  return values.filter((v): v is GiftCategory => VALID_CATEGORY_SET.has(v));
}

export function toAlgorithmProfile(
  dbProfile: DbProfile,
  displayName: string,
): AlgoProfile {
  return {
    userId: dbProfile.userId,
    displayName,
    birthday: dbProfile.birthday,
    partyStyle: dbProfile.partyStyle ?? undefined,
    favoriteColor: dbProfile.favoriteColor ?? undefined,
    giftCategoriesLiked: asCategories(dbProfile.giftCategoriesLiked),
    giftCategoriesDisliked: asCategories(dbProfile.giftCategoriesDisliked),
    hobbies: dbProfile.hobbies,
    wontBuySelf: dbProfile.wontBuySelf,
    underTenItems: dbProfile.underTenItems,
    wishList: dbProfile.wishList,
    giftCardStores: dbProfile.giftCardStores,
    secretWish: dbProfile.secretWish ?? undefined,
    sizes: dbProfile.sizes as AlgoProfile['sizes'],
    doNotGift: dbProfile.doNotGift,
    bigFive: dbProfile.bigFive ?? undefined,
  };
}

export function ageYearsFromBirthday(birthday: string | null): number | undefined {
  if (!birthday) return undefined;
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
