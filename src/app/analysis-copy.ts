import { Language } from './i18n';
import { CategoryId } from './models';
interface AnalysisCopy {
  open: string; title: string; close: string; loading: string; unavailable: string; busy: string;
  retry: string; nearby: string; none: string; partial: string; counts: string; distanceHelp: string;
  coverageHelp: string; sourceDate: string; meters: string; kilometers: string; openOsm: string; transportHelp: string;
  categories: Record<CategoryId, string>; kinds: Record<string, string>;
}
export const ANALYSIS_COPY: Record<Language, AnalysisCopy> = {
  pl: {
    open: 'Analizuj okolicę', title: 'Okolica w OSM', close: 'Zamknij analizę', loading: 'Pobieramy obiekty z OpenStreetMap…',
    unavailable: 'Dane OSM są teraz niedostępne. Spróbuj ponownie później.', busy: 'Trwa inne zapytanie. Odczekaj kilka sekund.',
    retry: 'Spróbuj ponownie', nearby: 'Najbliższe obiekty', none: 'Nie znaleziono w OSM w promieniu 1 km.',
    transportHelp: 'Liczymy punkty wsiadania i wejścia. Jedna stacja może mieć kilka obiektów.',
    partial: 'Część geometrii jest niekompletna i została pominięta.', counts: 'Obiekty w zasięgu',
    distanceHelp: 'Do 1 km · odległość w linii prostej do obiektu, nie trasa piesza.',
    coverageHelp: 'OSM może być niepełne. Bliskość nie określa jakości szkoły ani dostępności brzegu.',
    sourceDate: 'Stan danych OSM', meters: 'm', kilometers: 'km', openOsm: 'Otwórz obiekt w OpenStreetMap',
    categories: {parks:'Parki',water:'Woda',schools:'Szkoły',kindergartens:'Przedszkola',groceries:'Sklepy spożywcze',pharmacies:'Apteki',transport:'Transport'},
    kinds: {park:'Park',garden:'Ogród',water:'Woda',lake:'Jezioro',pond:'Staw',river:'Rzeka',reservoir:'Zbiornik',school:'Szkoła',kindergarten:'Przedszkole',supermarket:'Supermarket',convenience:'Sklep spożywczy',pharmacy:'Apteka',bus_stop:'Przystanek autobusowy',tram_stop:'Przystanek tramwajowy',metro_entrance:'Wejście do metra',metro_station:'Stacja metra',rail_station:'Stacja kolejowa',platform:'Peron / przystanek'}
  },
  en: {
    open: 'Analyze surroundings', title: 'Surroundings in OSM', close: 'Close analysis', loading: 'Loading objects from OpenStreetMap…',
    unavailable: 'OSM data is currently unavailable. Please try again later.', busy: 'Another request is running. Wait a few seconds.',
    retry: 'Try again', nearby: 'Nearest objects', none: 'Not found in OSM within 1 km.',
    transportHelp: 'Counts boarding points and entrances. A station may have several mapped objects.',
    partial: 'Some incomplete geometries were omitted.', counts: 'Mapped objects within',
    distanceHelp: 'Within 1 km · straight-line distance to the object, not a walking route.',
    coverageHelp: 'OSM may be incomplete. Proximity does not indicate school quality or access to a shore.',
    sourceDate: 'OSM data snapshot', meters: 'm', kilometers: 'km', openOsm: 'Open object in OpenStreetMap',
    categories: {parks:'Parks',water:'Water',schools:'Schools',kindergartens:'Kindergartens',groceries:'Groceries',pharmacies:'Pharmacies',transport:'Transport'},
    kinds: {park:'Park',garden:'Garden',water:'Water',lake:'Lake',pond:'Pond',river:'River',reservoir:'Reservoir',school:'School',kindergarten:'Kindergarten',supermarket:'Supermarket',convenience:'Grocery store',pharmacy:'Pharmacy',bus_stop:'Bus stop',tram_stop:'Tram stop',metro_entrance:'Metro entrance',metro_station:'Metro station',rail_station:'Rail station',platform:'Platform / stop'}
  },
  be: {
    open: 'Аналізаваць наваколле', title: 'Наваколле ў OSM', close: 'Закрыць аналіз', loading: 'Загружаем аб’екты з OpenStreetMap…',
    unavailable: 'Даныя OSM цяпер недаступныя. Паспрабуйце пазней.', busy: 'Выконваецца іншы запыт. Пачакайце некалькі секунд.',
    retry: 'Паспрабаваць яшчэ раз', nearby: 'Найбліжэйшыя аб’екты', none: 'Не знойдзена ў OSM у радыусе 1 км.',
    transportHelp: 'Лічым пункты пасадкі і ўваходы. Адна станцыя можа мець некалькі аб’ектаў.',
    partial: 'Частка няпоўнай геаметрыі прапушчаная.', counts: 'Аб’екты ў межах',
    distanceHelp: 'Да 1 км · адлегласць па прамой да аб’екта, не пешы маршрут.',
    coverageHelp: 'OSM можа быць няпоўнай. Блізкасць не вызначае якасць школы ці доступ да берага.',
    sourceDate: 'Зрэз даных OSM', meters: 'м', kilometers: 'км', openOsm: 'Адкрыць аб’ект у OpenStreetMap',
    categories: {parks:'Паркі',water:'Вада',schools:'Школы',kindergartens:'Дзіцячыя сады',groceries:'Прадуктовыя крамы',pharmacies:'Аптэкі',transport:'Транспарт'},
    kinds: {park:'Парк',garden:'Сад',water:'Вадаём',lake:'Возера',pond:'Сажалка',river:'Рака',reservoir:'Вадасховішча',school:'Школа',kindergarten:'Дзіцячы сад',supermarket:'Супермаркет',convenience:'Прадуктовая крама',pharmacy:'Аптэка',bus_stop:'Аўтобусны прыпынак',tram_stop:'Трамвайны прыпынак',metro_entrance:'Уваход у метро',metro_station:'Станцыя метро',rail_station:'Чыгуначная станцыя',platform:'Платформа / прыпынак'}
  },
  ru: {
    open: 'Анализировать окружение', title: 'Окружение по OSM', close: 'Закрыть анализ', loading: 'Загружаем объекты из OpenStreetMap…',
    unavailable: 'Данные OSM сейчас недоступны. Попробуйте позже.', busy: 'Выполняется другой запрос. Подождите несколько секунд.',
    retry: 'Попробовать ещё раз', nearby: 'Ближайшие объекты', none: 'Не найдено в OSM в радиусе 1 км.',
    transportHelp: 'Считаем точки посадки и входы. У одной станции может быть несколько объектов.',
    partial: 'Часть неполной геометрии пропущена.', counts: 'Объекты в пределах',
    distanceHelp: 'До 1 км · расстояние по прямой до объекта, не пеший маршрут.',
    coverageHelp: 'OSM может быть неполной. Близость не определяет качество школы или доступ к берегу.',
    sourceDate: 'Срез данных OSM', meters: 'м', kilometers: 'км', openOsm: 'Открыть объект в OpenStreetMap',
    categories: {parks:'Парки',water:'Водоёмы',schools:'Школы',kindergartens:'Детские сады',groceries:'Продуктовые магазины',pharmacies:'Аптеки',transport:'Транспорт'},
    kinds: {park:'Парк',garden:'Сад',water:'Водоём',lake:'Озеро',pond:'Пруд',river:'Река',reservoir:'Водохранилище',school:'Школа',kindergarten:'Детский сад',supermarket:'Супермаркет',convenience:'Продуктовый магазин',pharmacy:'Аптека',bus_stop:'Автобусная остановка',tram_stop:'Трамвайная остановка',metro_entrance:'Вход в метро',metro_station:'Станция метро',rail_station:'Железнодорожная станция',platform:'Платформа / остановка'}
  }
};

export const RATING_COPY = {
  ru: {
    scoreTitle:'Доступность по OSM', preliminary:'Предварительная оценка', method:'Как считается балл', points:'б.',
    scoreCaption:'Близость объектов, не качество района. Полнота OSM не гарантирована.',
    scoreUnavailable:'Недостаточно данных OSM для общего балла. Доступные факторы показаны ниже.',
    scoreHelp:'Оцениваем близость отмеченных объектов по прямой в радиусе 1 км. Зелень — только парки, здоровье — только аптеки. Это наша простая модель, а не оценка качества жилья. Водоёмы и количество объектов не дают баллов.',
    scoreFormula:'До порога — 100, затем линейное снижение до 0 на 1 км. Не найдено в OSM — 0, что не доказывает отсутствие объекта. Школа и детсад имеют равный вклад в образование. Итог — сумма баллов факторов с указанными весами. Неполная геометрия исключает общий балл.',
    factors:{green:'Парки',daily:'Магазины',transport:'Транспорт',health:'Аптеки',education:'Школы и детсады'}
  },
  be: {
    scoreTitle:'Даступнасць паводле OSM', preliminary:'Папярэдняя ацэнка', method:'Як разлічваецца бал', points:'б.',
    scoreCaption:'Блізкасць аб’ектаў, не якасць раёна. Паўната OSM не гарантаваная.',
    scoreUnavailable:'Недастаткова даных OSM для агульнага бала. Даступныя фактары паказаныя ніжэй.',
    scoreHelp:'Ацэньваем блізкасць пазначаных аб’ектаў па прамой у радыусе 1 км. Зеляніна — толькі паркі, здароўе — толькі аптэкі. Гэта наша простая мадэль, а не ацэнка якасці жылля. Вадаёмы і колькасць аб’ектаў не даюць балаў.',
    scoreFormula:'Да парога — 100, затым лінейнае зніжэнне да 0 на 1 км. Не знойдзена ў OSM — 0, што не даказвае адсутнасці аб’екта. Школа і дзіцячы сад маюць роўны ўклад у адукацыю. Вынік — сума балаў фактараў з пазначанымі вагамі. Няпоўная геаметрыя выключае агульны бал.',
    factors:{green:'Паркі',daily:'Крамы',transport:'Транспарт',health:'Аптэкі',education:'Школы і дзіцячыя сады'}
  },
  pl: {
    scoreTitle:'Dostępność według OSM', preliminary:'Ocena wstępna', method:'Jak obliczamy wynik', points:'pkt',
    scoreCaption:'Bliskość obiektów, nie jakość dzielnicy. Kompletność OSM nie jest gwarantowana.',
    scoreUnavailable:'Za mało danych OSM do wyniku łącznego. Dostępne czynniki pokazujemy poniżej.',
    scoreHelp:'Oceniamy odległość w linii prostej do obiektów OSM w promieniu 1 km. Zieleń oznacza tylko parki, zdrowie — tylko apteki. To nasz prosty model, a nie ocena jakości mieszkania. Woda i liczba obiektów nie dodają punktów.',
    scoreFormula:'Do progu — 100, potem liniowy spadek do 0 przy 1 km. Brak w OSM — 0, co nie dowodzi braku obiektu. Szkoła i przedszkole mają równy udział w edukacji. Wynik to suma punktów czynników z podanymi wagami. Niepełna geometria wyklucza wynik łączny.',
    factors:{green:'Parki',daily:'Sklepy',transport:'Transport',health:'Apteki',education:'Szkoły i przedszkola'}
  },
  en: {
    scoreTitle:'OSM accessibility', preliminary:'Preliminary score', method:'How the score works', points:'pts',
    scoreCaption:'Proximity, not neighbourhood quality. OSM completeness is unknown.',
    scoreUnavailable:'Insufficient OSM data for a combined score. Available factors are shown below.',
    scoreHelp:'We score straight-line proximity to mapped objects within 1 km. Green space means parks only; health means pharmacies only. This is our simple model, not a housing quality rating. Water and object counts add no points.',
    scoreFormula:'100 up to the threshold, then a linear decline to 0 at 1 km. Not found in OSM means 0, not proof of absence. Schools and kindergartens contribute equally to education. The total sums factor scores with the displayed weights. Incomplete geometry prevents a combined score.',
    factors:{green:'Parks',daily:'Groceries',transport:'Transport',health:'Pharmacies',education:'Schools & childcare'}
  }
};
