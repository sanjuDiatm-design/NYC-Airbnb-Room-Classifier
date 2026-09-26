# 🗽 NYC Airbnb Room Type Classifier

An end-to-end machine learning web application that predicts the **room type** of any New York City Airbnb listing based on its key characteristics — built with FastAPI, scikit-learn, and a sleek dark-themed vanilla JS frontend.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-orange?logo=scikit-learn)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 What It Does

Given 10 listing features, the model classifies any NYC Airbnb into one of **3 room types**:

| Room Type | Description |
|---|---|
| 🏠 Entire Home / Apt | The whole property is rented out |
| 🚪 Private Room | A private room in a shared home |
| 🛏️ Shared Room | A shared sleeping space |

---

## 🧠 Model

- **Algorithm:** Random Forest Classifier
- **Dataset:** [NYC Airbnb Open Data](https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data)
- **Preprocessing Pipeline:** SimpleImputer → StandardScaler + OneHotEncoder → ColumnTransformer
- **Serialization:** `joblib` (saved as `Model_Pipeline.pkl`)

### Input Features

| Feature | Type | Description |
|---|---|---|
| `latitude` | float | Listing latitude |
| `longitude` | float | Listing longitude |
| `price` | float | Price per night ($) |
| `minimum_nights` | int | Minimum nights required |
| `number_of_reviews` | int | Total reviews |
| `reviews_per_month` | float | Average monthly reviews |
| `calculated_host_listings_count` | int | Total listings by host |
| `availability_365` | int | Days available per year |
| `neighbourhood_group` | str | Borough (Manhattan, Brooklyn, etc.) |
| `neighbourhood` | str | Specific neighbourhood |

---

## 🏗️ Project Structure

```
NYC-Airbnb-Room-Classifier/
├── main.py                 # FastAPI app + sklearn compat patches
├── Model_Pipeline.pkl      # Trained scikit-learn pipeline
├── index.html              # Frontend UI
├── style.css               # Dark theme + animations
├── app.js                  # Form logic + API integration
├── requirements.txt        # Python dependencies
├── Procfile                # Render deployment config
├── .python-version         # Python 3.12 pin
└── .gitignore
```

---

## 🚀 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/sanjuDiatm-design/NYC-Airbnb-Room-Classifier.git
cd NYC-Airbnb-Room-Classifier
```

### 2. Create virtual environment & install dependencies
```bash
python -m venv venv
.\venv\Scripts\Activate      # Windows
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### 3. Start the API
```bash
uvicorn main:app --reload
# API running at http://127.0.0.1:8000
```

### 4. Start the frontend (in a second terminal)
```bash
python -m http.server 3000
# Open http://localhost:3000 in your browser
```

> ⚠️ **Do not open `index.html` directly** as a `file://` URL — browsers will block the API call. Always use the HTTP server.

---

## 📡 API Reference

### `GET /`
Health check.
```json
"Hello Guyss"
```

### `POST /predict`

**Request body:**
```json
{
  "latitude": 40.8116,
  "longitude": -73.9465,
  "price": 120,
  "minimum_nights": 2,
  "number_of_reviews": 45,
  "reviews_per_month": 1.5,
  "calculated_host_listings_count": 3,
  "availability_365": 180,
  "neighbourhood_group": "Manhattan",
  "neighbourhood": "Harlem"
}
```

**Response:**
```json
{
  "Predicted_room_type": "Private room",
  "Probability": [0.448, 0.484, 0.068]
}
```

> Probabilities correspond to `["Entire home/apt", "Private room", "Shared room"]` in that order.

---

## 🌐 Deployment (Render)

### Backend (Web Service)
1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect this GitHub repo
3. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy → copy your Render URL

### Frontend (Static Site)
1. Render → New → **Static Site**
2. Connect same repo
3. **Publish Directory:** `.`
4. Update `API_BASE` in `app.js` with your Render Web Service URL

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ML Model | scikit-learn (Random Forest) |
| API | FastAPI + Pydantic |
| Server | Uvicorn |
| Data | pandas |
| Serialization | joblib |
| Frontend | HTML + CSS + Vanilla JS |
| Deployment | Render |

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

## 👤 Author

**Sanju Ghosh** · [@sanjuDiatm-design](https://github.com/sanjuDiatm-design)
