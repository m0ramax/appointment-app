import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { workScheduleService } from "../../lib/api/work-schedule";

export default function SimpleScheduleTest() {
  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Loading user data...");
      
      const userData = await authService.getProfile();
      console.log("User data:", userData);
      setUser(userData);

      if (userData?.id) {
        console.log("Loading schedules for provider:", userData.id);
        const schedulesData = await workScheduleService.getProviderWorkSchedules(userData.id);
        console.log("Schedules data:", schedulesData);
        setSchedules(schedulesData);
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || err.response?.data?.detail || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const createTestSchedule = async () => {
    if (!user?.id) return;
    
    try {
      console.log("Creating test schedule...");
      const newSchedule = {
        provider_id: user.id,
        day_of_week: 1, // Monday
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: 30,
        is_active: true
      };
      
      console.log("Schedule data:", newSchedule);
      const result = await workScheduleService.createWorkSchedule(newSchedule);
      console.log("Created schedule:", result);
      
      // Reload data
      await loadData();
    } catch (err: any) {
      console.error("Error creating schedule:", err);
      setError(err.response?.data?.detail || "Error al crear horario");
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded">
        <p>Cargando datos de prueba...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="font-bold">Debug: Prueba de Horarios</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium">Usuario actual:</h4>
        <pre className="text-xs mt-2">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium">Horarios ({schedules.length}):</h4>
        <pre className="text-xs mt-2">{JSON.stringify(schedules, null, 2)}</pre>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recargar Datos
        </button>
        <button
          onClick={createTestSchedule}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!user?.id || user.role !== 'provider'}
        >
          Crear Horario de Prueba
        </button>
      </div>
    </div>
  );
}