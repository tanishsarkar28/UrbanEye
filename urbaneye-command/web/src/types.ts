export type Role = 'NATIONAL_ADMIN' | 'STATE_ADMIN' | 'DISTRICT_HEAD';

export type EventStatus = 'NEW' | 'REVIEWED' | 'ASSIGNED_FOR_REPAIR' | 'RESOLVED';

export type DefectType = 'POTHOLE' | 'ROAD_CRACK' | 'SURFACE_DAMAGE' | 'WATERLOGGING' | 'VEHICLE_FLOW';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  stateId?: string | null;
  stateName?: string | null;
  stateCode?: string | null;
  districtId?: string | null;
  districtName?: string | null;
}

export interface State {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLon: number;
  districts?: District[];
}

export interface District {
  id: string;
  code: string;
  name: string;
  stateId: string;
  centerLat: number;
  centerLon: number;
  minLat?: number | null;
  maxLat?: number | null;
  minLon?: number | null;
  maxLon?: number | null;
  _count?: {
    events: number;
    sessions: number;
  };
}

export interface BusSession {
  id: string;
  pin: string;
  status: 'PENDING' | 'PAIRED' | 'EXPIRED';
  busLabel: string | null;
  routeTag: string | null;
  districtId: string | null;
  district?: {
    name: string;
    code: string;
  };
  pairedAt?: string | null;
  lastHeartbeat: string;
  _count?: {
    events: number;
  };
}

export interface RoadEvent {
  id: string;
  deviceSessionId: string;
  busLabel: string;
  districtId: string;
  district?: {
    name: string;
    code: string;
  };
  type: DefectType;
  confidence: number;
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  imageSnippet?: string | null;
  status: EventStatus;
  reviewedByUserId?: string | null;
  reviewedByUser?: {
    name: string;
    role: string;
  } | null;
  reviewNotes?: string | null;
  timestamp: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalEvents: number;
  byStatus: {
    new: number;
    reviewed: number;
    assigned: number;
    resolved: number;
  };
  byType: {
    pothole: number;
    roadCrack: number;
    surfaceDamage: number;
    waterlogging: number;
    vehicleFlow: number;
  };
  activeBusesCount: number;
  roadHealthScore: number;
}

export interface DistrictSummaryItem {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLon: number;
  totalDefects: number;
  newDefects: number;
  assignedDefects: number;
  resolvedDefects: number;
  activeBusesCount: number;
  roadHealthScore: number;
}

export interface StateSummaryItem {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLon: number;
  districtsCount: number;
  totalDefects: number;
  newDefects: number;
  assignedDefects: number;
  resolvedDefects: number;
  activeBusesCount: number;
  roadHealthScore: number;
}

export interface HierarchySummary {
  totalActiveBuses: number;
  totalNewDefects: number;
  totalAssignedDefects: number;
  totalResolvedDefects: number;
  totalDefects: number;
  averageRoadHealthIndex: number;
}

export interface NationalSummaryResponse {
  states: StateSummaryItem[];
  summary: HierarchySummary;
}

export interface StateSummaryResponse {
  state: {
    id: string;
    code: string;
    name: string;
    centerLat: number;
    centerLon: number;
  };
  districts: DistrictSummaryItem[];
  summary: HierarchySummary;
}

