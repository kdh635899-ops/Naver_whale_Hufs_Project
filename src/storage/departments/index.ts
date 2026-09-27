import departments from "../../constants/departments.json";
import { DEFAULT_DEPARTMENT_ID } from "../../constants/department";

export const MY_DEPARTMENTS_KEY = "myDepartments";
export const MAX_MY_DEPARTMENTS = 3;

export type DepartmentRole = "major" | "double" | "minor";
export const ROLE_LABEL: Record<DepartmentRole, string> = { major: "본전공", double: "이중전공", minor: "부전공" };

export interface MyDepartment {
  /** departments.json에 있는 학과면 그 id (공지 게시판을 알 수 있다). 직접 추가한 학과는 "custom:..." */
  id: string;
  name: string;
  homepage: string;
  role: DepartmentRole;
}

const isRole = (v: unknown): v is DepartmentRole => v === "major" || v === "double" || v === "minor";

function defaultDepartments(): MyDepartment[] {
  const d = departments.find((x) => x.id === DEFAULT_DEPARTMENT_ID);
  return d ? [{ id: d.id, name: d.name, homepage: d.homepage, role: "major" }] : [];
}

export function readMyDepartments(value: unknown): MyDepartment[] {
  if (!Array.isArray(value)) return defaultDepartments();
  return value.filter(
    (d): d is MyDepartment =>
      Boolean(d) && typeof d.id === "string" && typeof d.name === "string" && typeof d.homepage === "string" && isRole(d.role)
  );
}

export async function getMyDepartments(): Promise<MyDepartment[]> {
  const stored = await chrome.storage.local.get(MY_DEPARTMENTS_KEY);
  return readMyDepartments(stored[MY_DEPARTMENTS_KEY]);
}

export function saveMyDepartments(list: MyDepartment[]): Promise<void> {
  return chrome.storage.local.set({ [MY_DEPARTMENTS_KEY]: list.slice(0, MAX_MY_DEPARTMENTS) });
}
