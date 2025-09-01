import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ServiceSchedule {
  id: string;
  day_of_week: string;
  service_name: string;
  service_time: string;
  sort_order: number;
  leader: string | null;
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
    <div className="space-y-4">
      {Object.entries(groupedSchedules).map(([day, daySchedules]) => (
        <div key={day} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/60">
          <h3 className="font-bold text-primary text-lg mb-3">{day}</h3>
          <div className="space-y-2">
            {daySchedules.map((schedule) => (
              <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="font-medium text-primary">
                  {schedule.service_name} - {schedule.service_time}
                </div>
                {schedule.leader && (
                  <div className="text-sm text-muted-foreground">
                    Dirigente: {schedule.leader}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}