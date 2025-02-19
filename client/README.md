# ClickHouse assignment

## Preview

<video width="100%" controls>
  <source src="public/videos/preview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Getting Started

### Project description

This project is a simple SQL editor that allows you to run SQL queries on a ClickHouse database.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Run sql-editor (check root folder and sql-editor/README.md for more information) server locally with `docker compose up -d` and `npm i` and `npm run start`;

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [your-project-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_api_url
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Running the tests

```bash
npm run test
```

### Running the tests with UI

```bash
npm run test:ui
```

### Running the tests with coverage

```bash
npm run test:coverage
```

### Open the browser and run the queries

1. Open the application in your browser

2. Write your SQL query in the editor

```sql
SELECT * FROM example_data_csv;
SELECT name, age FROM example_data_csv;
SELECT * FROM example_data_csv WHERE age > 30;
SELECT * FROM example_data_csv WHERE city = 'Amsterdam';
SELECT * FROM example_data_csv ORDER BY age DESC;
SELECT * FROM example_data_csv ORDER BY name ASC;
SELECT city, COUNT(*) as count_per_city 
FROM example_data_csv 
GROUP BY city;
SELECT AVG(age) as average_age 
FROM example_data_csv;
SELECT * FROM example_data_csv 
WHERE age >= 25 AND age <= 30;
SELECT * FROM example_data_csv 
WHERE city LIKE 'S%';
SELECT DISTINCT city 
FROM example_data_csv;
SELECT age, COUNT(*) as people_count 
FROM example_data_csv 
GROUP BY age 
ORDER BY age;
```

3. Click on the "Run Query" button

4. See the results in the UI