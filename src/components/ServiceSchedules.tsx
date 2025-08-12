import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ServiceSchedule {
  id: string;
  day_of_week: string;
  service_name: string;
  service_time: string;
  sort_order: number;
}

export function ServiceSchedules() {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('service_schedules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white/60">Carregando horários...</div>;
  }

  // Group schedules by day
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = [];
    }
    acc[schedule.day_of_week].push(schedule);
    return acc;
  }, {} as Record<string, ServiceSchedule[]>);

  return (
    <div className="space-y-2 text-sm text-white/80">
      {Object.entries(groupedSchedules).map(([day, daySchedules]) => (
        <div key={day}>
          <span className="font-medium">{day}:</span>
          <div className="ml-2">
            {daySchedules.map((schedule) => (
              <div key={schedule.id}>
                {schedule.service_name} - {schedule.service_time}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}