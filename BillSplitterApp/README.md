# Bill Splitter - Multi-Currency React Native App

A modern, intuitive mobile app for splitting bills among friends and groups with **full multi-currency support**.

## 🌍 **Multi-Currency Features**

### 💱 **Comprehensive Currency Support**
- **16 Major Currencies**: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, KRW, SGD, HKD, SEK, NOK, MXN, BRL
- **Real-time Conversion**: Automatic conversion between currencies
- **Mixed Currency Bills**: Items can be in different currencies
- **Smart Exchange Rates**: Built-in exchange rate system
- **Currency-specific Formatting**: Proper symbols and decimal places

### 🎯 **Enhanced Bill Splitting**
- **Base Currency Selection**: Choose the main currency for your bill
- **Per-Item Currency**: Each item can have its own currency
- **Tax & Tip in Any Currency**: Add tax and tip in different currencies
- **Automatic Conversion**: All amounts converted to base currency for calculations
- **Exchange Rate Display**: See conversion rates between currencies

## 📱 **Core Features**

### 👥 **People Management**
- Add multiple people to split the bill
- Each person gets a unique color identifier
- Easy removal of people from the bill
- Visual confirmation of who's included

### 🧾 **Smart Item Management**
- Add items with custom names and prices
- **Multi-currency pricing**: Each item can be in any supported currency
- Assign items to specific people
- Equal splitting by default
- Visual breakdown of who owes what for each item
- **Currency conversion display**: See original price and converted amount

### 💰 **Advanced Bill Summary**
- **Multi-currency totals**: All amounts shown in base currency
- **Exchange rate transparency**: See how amounts were converted
- Add tax and tip in any currency with proportional distribution
- Detailed breakdown showing each person's items with original currencies
- Share bill summary via text, email, or social media
- **Currency-aware formatting**: Proper symbols and formatting for each currency

### 📱 **Mobile-First Design**
- Native iOS and Android support
- Responsive design that works on all screen sizes
- Intuitive tab-based navigation
- Clean, modern interface with currency indicators
- Smooth animations and transitions

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or later)
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. **Navigate to the app directory**
   ```bash
   cd BillSplitterApp
   npm install
   ```

2. **Run the App**

   **For Web Development:**
   ```bash
   npx expo start --web
   ```

   **For Mobile Development:**
   ```bash
   npx expo start
   ```
   Then scan the QR code with the Expo Go app on your phone.

   **For iOS Simulator:**
   ```bash
   npx expo start --ios
   ```

   **For Android Emulator:**
   ```bash
   npx expo start --android
   ```

## 📋 **How to Use with Multiple Currencies**

### Step 1: Set Base Currency
1. Go to the "Summary" tab
2. Select your preferred base currency (the currency for final calculations)
3. All final amounts will be shown in this currency

### Step 2: Add People
1. Open the "People" tab
2. Add everyone who will split the bill
3. Each person gets a unique color for easy identification

### Step 3: Add Items with Currencies
1. Switch to the "Items" tab
2. For each item:
   - Enter the item name and price
   - **Select the currency** for that specific item
   - Choose which people should split the item
3. Items can be in different currencies (e.g., lunch in EUR, taxi in USD)

### Step 4: Add Tax & Tip (Optional)
1. Go to the "Summary" tab
2. Add tax amount and select its currency
3. Add tip amount and select its currency
4. Both will be distributed proportionally and converted to base currency

### Step 5: Review Multi-Currency Summary
1. See each person's total in the base currency
2. View itemized breakdown showing original prices and converted amounts
3. Review exchange rates used for conversions
4. Share the complete summary with your group

## 💱 **Supported Currencies**

| Currency | Code | Symbol | Region |
|----------|------|--------|---------|
| US Dollar | USD | $ | United States |
| Euro | EUR | € | European Union |
| British Pound | GBP | £ | United Kingdom |
| Japanese Yen | JPY | ¥ | Japan |
| Canadian Dollar | CAD | C$ | Canada |
| Australian Dollar | AUD | A$ | Australia |
| Swiss Franc | CHF | CHF | Switzerland |
| Chinese Yuan | CNY | ¥ | China |
| Indian Rupee | INR | ₹ | India |
| South Korean Won | KRW | ₩ | South Korea |
| Singapore Dollar | SGD | S$ | Singapore |
| Hong Kong Dollar | HKD | HK$ | Hong Kong |
| Swedish Krona | SEK | kr | Sweden |
| Norwegian Krone | NOK | kr | Norway |
| Mexican Peso | MXN | $ | Mexico |
| Brazilian Real | BRL | R$ | Brazil |

## 🔧 **Technical Features**

- **TypeScript**: Full type safety throughout the app
- **React Native**: Cross-platform mobile development
- **Expo**: Simplified development and deployment
- **Multi-Currency Engine**: Sophisticated currency conversion system
- **Vector Icons**: Beautiful, scalable icons with currency symbols
- **Responsive Design**: Works on phones and tablets
- **State Management**: Efficient local state management with currency tracking
- **Real-time Calculations**: Instant updates with currency conversions

## 🌟 **Example Use Cases**

### International Travel
- **Scenario**: Traveling in Europe with friends
- **Solution**: Add items in EUR, USD, and GBP, set EUR as base currency
- **Result**: Everyone knows exactly how much they owe in EUR

### Business Lunch
- **Scenario**: International business meeting with mixed expenses
- **Solution**: Food in local currency, taxi in USD, tips in local currency
- **Result**: Clean summary for expense reports

### Group Vacation
- **Scenario**: Multi-country trip with various currencies
- **Solution**: Track all expenses in their original currencies
- **Result**: Fair splitting with accurate conversions

## 🎨 **Currency Display Features**

- **Smart Formatting**: JPY and KRW show no decimals, others show 2 decimal places
- **Currency Symbols**: Proper symbols for each currency (€, £, ¥, ₹, etc.)
- **Exchange Rate Info**: See conversion rates used (e.g., "1 $ = €0.85")
- **Dual Display**: Original amount and converted amount shown side by side
- **Color Coding**: Different currencies highlighted for easy identification

## 🔮 **Future Enhancements**

- [ ] Live exchange rate API integration
- [ ] Custom split amounts (not just equal splitting)
- [ ] Bill history with currency tracking
- [ ] Photo receipt scanning with currency detection
- [ ] Payment integration with multi-currency support
- [ ] Offline currency support with cached rates
- [ ] Currency trend charts and analysis

## 📝 **Technical Architecture**

### Currency System
- **Exchange Rate Engine**: Converts between any supported currencies
- **Calculation Engine**: Handles proportional distribution across currencies
- **Formatting Engine**: Displays currencies according to local conventions
- **State Management**: Tracks currency preferences per user and item

### Components
- **CurrencySelector**: Searchable currency picker with symbols
- **Multi-Currency Calculator**: Handles complex cross-currency calculations
- **Exchange Rate Display**: Shows conversion rates and calculations
- **Currency-Aware Formatters**: Proper display for each currency

## 📄 **License**

MIT License - Feel free to use this code for personal or commercial projects.

---

**Ready to split bills globally!** 🌍💰📱
