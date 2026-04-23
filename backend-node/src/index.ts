import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import userSettingsRoutes from './routes/user_settings';
import infrastructureRoutes from './routes/infrastructure';
import settingsRoutes from './routes/settings';
import weatherStationRoutes from './routes/weather_station';

const app = express();
const port = 3001; // Backend on 3001

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/settings/weather-station', weatherStationRoutes);

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});