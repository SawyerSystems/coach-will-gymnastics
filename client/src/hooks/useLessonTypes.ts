import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface LessonType {
  id: number;
  name: string;
  description?: string;
  price: number;
  reservationFee?: number;
  keyPoints?: string[];
  duration: number; // minutes
  isPrivate: boolean;
  maxAthletes: number;
  isActive: boolean;
}

export function useLessonTypes() {
  const query = useQuery<LessonType[]>({
    queryKey: ["/api/lesson-types"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/lesson-types");
      const data = await res.json();
      // Defensive normalize
      return (data || [])
        .filter((lt: any) => lt && lt.isActive !== false)
        .map((lt: any) => {
          // coerce id to number
          const id = typeof lt.id === 'string' ? parseInt(lt.id, 10) : lt.id;

          // normalize numeric price fields
          const totalPriceNum = lt.total_price !== undefined ? Number(lt.total_price) : (lt.totalPrice !== undefined ? Number(lt.totalPrice) : (lt.price !== undefined ? Number(lt.price) : NaN));
          const priceNum = Number.isFinite(totalPriceNum) ? totalPriceNum : 0;

          // normalize duration to minutes (number)
          const durationNum = Number(lt.duration_minutes ?? lt.durationMinutes ?? lt.duration ?? 0) || 0;

          const reservationFeeNum = Number(lt.reservation_fee ?? lt.reservationFee ?? 0) || 0;

          return {
            // keep original fields for compatibility, but ensure canonical fields exist
            ...lt,
            id: Number.isFinite(Number(id)) ? Number(id) : 0,
            // canonical numeric price used by UI
            price: priceNum,
            // some components expect totalPrice as string; keep numeric and string flavors
            totalPrice: priceNum,
            total_price: lt.total_price, // keep raw if needed
            // duration in minutes
            duration: durationNum,
            durationMinutes: durationNum,
            reservationFee: reservationFeeNum,
            reservation_fee: lt.reservation_fee ?? lt.reservationFee ?? 0,
            // ensure booleans are normalized
            isPrivate: Boolean(lt.is_private ?? lt.isPrivate),
            isActive: lt.is_active === undefined ? true : Boolean(lt.is_active),
            maxAthletes: lt.max_athletes ?? lt.maxAthletes ?? (lt.is_private ? 1 : 2),
          } as any;
        });
    },
    staleTime: 60_000,
  });

  // Helpers
  const byKey = (key: string) => {
    // Our state.state.lessonType holds keys like 'quick-journey'. Map heuristically by name.
    const map: Record<string, string> = {
      "quick-journey": "Quick Journey",
      "dual-quest": "Dual Quest",
      "deep-dive": "Deep Dive",
      "partner-progression": "Partner Progression",
    };
    const name = map[key] || key;
    return (query.data || []).find((lt) => lt.name === name);
  };

  const formatDuration = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return "";
    if (!Number.isFinite(minutes) || minutes <= 0) return "";
    return `${minutes} minutes`;
  };

  const maxFocusAreasFor = (lt?: LessonType) => {
    if (!lt) return 2;
    return lt.duration >= 60 ? 4 : 2;
  };

  return {
    ...query,
    byKey,
    formatDuration,
    maxFocusAreasFor,
  };
}
