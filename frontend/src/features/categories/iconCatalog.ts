/** Curated react-icons entries for category picker (search matches label or export name). */

export type IconPackId = 'fa' | 'md' | 'bi' | 'hi' | 'io5'

export type CatalogIcon = {
  name: string
  pack: IconPackId
  label: string
}

export const DEFAULT_ICON_NAME = 'FaWallet'
export const DEFAULT_ICON_PACK: IconPackId = 'fa'

export const CATEGORY_ICON_CATALOG: CatalogIcon[] = [
  // Home & living
  { name: 'FaHome', pack: 'fa', label: 'Home' },
  { name: 'MdHome', pack: 'md', label: 'Home (MD)' },
  { name: 'BiHome', pack: 'bi', label: 'Home (BI)' },
  { name: 'HiHome', pack: 'hi', label: 'House' },
  { name: 'IoHomeOutline', pack: 'io5', label: 'Home (IO)' },
  { name: 'FaCouch', pack: 'fa', label: 'Furniture' },
  { name: 'MdCleaningServices', pack: 'md', label: 'Cleaning' },
  { name: 'FaToolbox', pack: 'fa', label: 'Maintenance' },
  // Food & dining
  { name: 'FaUtensils', pack: 'fa', label: 'Dining' },
  { name: 'MdRestaurant', pack: 'md', label: 'Restaurant' },
  { name: 'IoFastFood', pack: 'io5', label: 'Fast food' },
  { name: 'FaCoffee', pack: 'fa', label: 'Coffee' },
  { name: 'BiCoffee', pack: 'bi', label: 'Coffee (BI)' },
  { name: 'MdLocalBar', pack: 'md', label: 'Bar' },
  { name: 'FaWineGlass', pack: 'fa', label: 'Wine' },
  { name: 'FaBreadSlice', pack: 'fa', label: 'Groceries' },
  { name: 'MdShoppingBasket', pack: 'md', label: 'Basket' },
  // Transport
  { name: 'FaCar', pack: 'fa', label: 'Car' },
  { name: 'MdDirectionsCar', pack: 'md', label: 'Vehicle' },
  { name: 'FaBus', pack: 'fa', label: 'Bus' },
  { name: 'FaTrain', pack: 'fa', label: 'Train' },
  { name: 'FaPlane', pack: 'fa', label: 'Flight' },
  { name: 'MdFlight', pack: 'md', label: 'Travel' },
  { name: 'FaGasPump', pack: 'fa', label: 'Fuel' },
  { name: 'FaParking', pack: 'fa', label: 'Parking' },
  { name: 'FaBicycle', pack: 'fa', label: 'Bike' },
  // Money & finance
  { name: 'FaWallet', pack: 'fa', label: 'Wallet' },
  { name: 'FaMoneyBillWave', pack: 'fa', label: 'Cash' },
  { name: 'MdAttachMoney', pack: 'md', label: 'Money' },
  { name: 'FaPiggyBank', pack: 'fa', label: 'Savings' },
  { name: 'FaCreditCard', pack: 'fa', label: 'Card' },
  { name: 'MdCreditCard', pack: 'md', label: 'Credit card' },
  { name: 'FaChartLine', pack: 'fa', label: 'Investments' },
  { name: 'MdTrendingUp', pack: 'md', label: 'Trend up' },
  { name: 'FaUniversity', pack: 'fa', label: 'Bank' },
  { name: 'FaHandHoldingUsd', pack: 'fa', label: 'Loan' },
  { name: 'FaCoins', pack: 'fa', label: 'Coins' },
  // Shopping
  { name: 'FaShoppingCart', pack: 'fa', label: 'Cart' },
  { name: 'MdShoppingCart', pack: 'md', label: 'Shopping' },
  { name: 'FaShoppingBag', pack: 'fa', label: 'Bag' },
  { name: 'BiShoppingBag', pack: 'bi', label: 'Shopping bag' },
  { name: 'FaStore', pack: 'fa', label: 'Store' },
  { name: 'MdStorefront', pack: 'md', label: 'Storefront' },
  { name: 'FaTag', pack: 'fa', label: 'Deals' },
  // Health & fitness
  { name: 'FaHeartbeat', pack: 'fa', label: 'Health' },
  { name: 'MdLocalHospital', pack: 'md', label: 'Hospital' },
  { name: 'FaPills', pack: 'fa', label: 'Pharmacy' },
  { name: 'FaStethoscope', pack: 'fa', label: 'Medical' },
  { name: 'FaRunning', pack: 'fa', label: 'Fitness' },
  { name: 'MdFitnessCenter', pack: 'md', label: 'Gym' },
  { name: 'FaSpa', pack: 'fa', label: 'Wellness' },
  // Family & people
  { name: 'FaBaby', pack: 'fa', label: 'Baby' },
  { name: 'MdChildCare', pack: 'md', label: 'Childcare' },
  { name: 'FaDog', pack: 'fa', label: 'Pets' },
  { name: 'FaUsers', pack: 'fa', label: 'Family' },
  // Work & education
  { name: 'FaBriefcase', pack: 'fa', label: 'Work' },
  { name: 'MdWork', pack: 'md', label: 'Office' },
  { name: 'FaLaptop', pack: 'fa', label: 'Remote work' },
  { name: 'FaGraduationCap', pack: 'fa', label: 'Education' },
  { name: 'MdSchool', pack: 'md', label: 'School' },
  { name: 'FaBook', pack: 'fa', label: 'Books' },
  { name: 'FaChalkboardTeacher', pack: 'fa', label: 'Teaching' },
  // Entertainment
  { name: 'FaFilm', pack: 'fa', label: 'Movies' },
  { name: 'MdMovie', pack: 'md', label: 'Cinema' },
  { name: 'FaMusic', pack: 'fa', label: 'Music' },
  { name: 'FaGamepad', pack: 'fa', label: 'Games' },
  { name: 'MdSportsEsports', pack: 'md', label: 'Esports' },
  { name: 'FaTicketAlt', pack: 'fa', label: 'Events' },
  { name: 'FaTheaterMasks', pack: 'fa', label: 'Theatre' },
  // Utilities & bills
  { name: 'FaBolt', pack: 'fa', label: 'Electric' },
  { name: 'MdElectricBolt', pack: 'md', label: 'Energy' },
  { name: 'FaTint', pack: 'fa', label: 'Water' },
  { name: 'FaWifi', pack: 'fa', label: 'Internet' },
  { name: 'MdWifi', pack: 'md', label: 'Wi‑Fi' },
  { name: 'FaMobileAlt', pack: 'fa', label: 'Mobile' },
  { name: 'FaTv', pack: 'fa', label: 'TV' },
  // Housing & property
  { name: 'FaBuilding', pack: 'fa', label: 'Building' },
  { name: 'MdApartment', pack: 'md', label: 'Apartment' },
  { name: 'FaKey', pack: 'fa', label: 'Rent' },
  { name: 'FaHammer', pack: 'fa', label: 'Repairs' },
  // Gifts & charity
  { name: 'FaGift', pack: 'fa', label: 'Gifts' },
  { name: 'MdCardGiftcard', pack: 'md', label: 'Gift card' },
  { name: 'FaHandHoldingHeart', pack: 'fa', label: 'Donations' },
  // Misc
  { name: 'FaEllipsisH', pack: 'fa', label: 'Other' },
  { name: 'MdCategory', pack: 'md', label: 'Category' },
  { name: 'BiCategory', pack: 'bi', label: 'Categories' },
  { name: 'HiStar', pack: 'hi', label: 'Misc' },
  { name: 'IoEarthOutline', pack: 'io5', label: 'General' },
]
