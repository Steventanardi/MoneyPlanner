# How to Run Money Planner

Follow these steps to set up and run the application on your local machine.

## Prerequisites
- **Node.js**: Version 20.0.0 or higher.
- **npm**: Installed with Node.js.

## Installation

1.  **Clone or Open the Project**:
    Navigate to the project root directory (`d:\Money Planner`).

2.  **Install Dependencies**:
    Run the following command in your terminal:
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the Development Server**:
    Run the following command:
    ```bash
    npm run dev
    ```

2.  **Access the Application**:
    Once the server starts, it will provide a URL (usually `http://localhost:5173`). Open this URL in your web browser.

## Features Added
- **Bank Management**: Add, edit, and delete bank accounts in the "Vault" screen.
- **Transaction Search & Edit**: Search for transactions by category or bank and edit them in the "History" screen.
- **Recurring Items**: Manage subscriptions and bills in the "Recurring" screen with the ability to add and delete them.
- **CSV Export**: Export all your data to a CSV file from the "Settings" section (top right icon in Finance/Dashboard).
- **Dashboard Enhancements**: View "Safe to Spend" daily budget and progress towards your "Shared Goal".

## Notes
- The application uses `localStorage` to save your data, so it will persist in your browser.
- Exchange rates are fetched live from a public API.
