export type Language = 'en' | 'pl' | 'be' | 'ru';
export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' }, { code: 'pl', name: 'Polski' },
  { code: 'be', name: 'Беларуская' }, { code: 'ru', name: 'Русский' }
];
export const PL = {
  language: 'Język', address: 'Adres', placeholder: 'Wpisz adres',
  chooseCountry: 'Wybierz kraj', country: 'Kraj', changeCountry: 'Zmień kraj',
  countriesError: 'Nie udało się wczytać krajów.', retry: 'Spróbuj ponownie',
  search: 'Szukaj', searching: 'Wyszukiwanie…', clear: 'Wyczyść',
  empty: 'Nie znaleziono adresu.', invalid: 'Wpisz od 3 do 200 znaków.',
  error: 'Nie udało się wyszukać adresu. Spróbuj ponownie.',
  rateError: 'Odczekaj kilka sekund i spróbuj ponownie.',
  timeout: 'Wyszukiwanie trwało zbyt długo. Spróbuj ponownie.',
  zoomIn: 'Przybliż', zoomOut: 'Oddal', mapLabel: 'Mapa',
  tileError: 'Nie udało się wczytać mapy. Sprawdź połączenie.',
  boundaryError: 'Nie udało się wczytać granicy kraju.'
};
export type Copy = { [K in keyof typeof PL]: string };
export const EN: Copy = {
  language: 'Language', address: 'Address', placeholder: 'Enter an address',
  chooseCountry: 'Choose a country', country: 'Country', changeCountry: 'Change country',
  countriesError: 'Could not load countries.', retry: 'Try again',
  search: 'Search', searching: 'Searching…', clear: 'Clear',
  empty: 'No address found.', invalid: 'Enter between 3 and 200 characters.',
  error: 'Address search failed. Please try again.',
  rateError: 'Wait a few seconds and try again.',
  timeout: 'Search timed out. Please try again.',
  zoomIn: 'Zoom in', zoomOut: 'Zoom out', mapLabel: 'Map',
  tileError: 'Could not load the map. Check your connection.',
  boundaryError: 'Could not load the country boundary.'
};
export const BE: Copy = {
  language: 'Мова', address: 'Адрас', placeholder: 'Увядзіце адрас',
  chooseCountry: 'Выберыце краіну', country: 'Краіна', changeCountry: 'Змяніць краіну',
  countriesError: 'Не ўдалося загрузіць краіны.', retry: 'Паспрабаваць яшчэ раз',
  search: 'Знайсці', searching: 'Пошук…', clear: 'Ачысціць',
  empty: 'Адрас не знойдзены.', invalid: 'Увядзіце ад 3 да 200 сімвалаў.',
  error: 'Не ўдалося знайсці адрас. Паспрабуйце яшчэ раз.',
  rateError: 'Пачакайце некалькі секунд і паспрабуйце яшчэ раз.',
  timeout: 'Час чакання скончыўся. Паспрабуйце яшчэ раз.',
  zoomIn: 'Наблізіць', zoomOut: 'Аддаліць', mapLabel: 'Карта',
  tileError: 'Не ўдалося загрузіць карту. Праверце злучэнне.',
  boundaryError: 'Не ўдалося загрузіць мяжу краіны.'
};
export const RU: Copy = {
  language: 'Язык', address: 'Адрес', placeholder: 'Введите адрес',
  chooseCountry: 'Выберите страну', country: 'Страна', changeCountry: 'Сменить страну',
  countriesError: 'Не удалось загрузить страны.', retry: 'Попробовать ещё раз',
  search: 'Найти', searching: 'Поиск…', clear: 'Очистить',
  empty: 'Адрес не найден.', invalid: 'Введите от 3 до 200 символов.',
  error: 'Не удалось найти адрес. Попробуйте ещё раз.',
  rateError: 'Подождите несколько секунд и попробуйте ещё раз.',
  timeout: 'Время ожидания истекло. Попробуйте ещё раз.',
  zoomIn: 'Приблизить', zoomOut: 'Отдалить', mapLabel: 'Карта',
  tileError: 'Не удалось загрузить карту. Проверьте соединение.',
  boundaryError: 'Не удалось загрузить границу страны.'
};
export const TRANSLATIONS: Record<Language, Copy> = { en: EN, pl: PL, be: BE, ru: RU };
