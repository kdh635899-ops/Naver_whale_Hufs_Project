import { useState, type DragEvent, type FormEvent } from "react";
import "./LinksPage.css";
import departments from "../../../constants/departments.json";
import { useStorageValue } from "../../../hooks/useStorageValue";
import {
  MAX_MY_DEPARTMENTS,
  MY_DEPARTMENTS_KEY,
  ROLE_LABEL,
  readMyDepartments,
  saveMyDepartments,
  type DepartmentRole,
  type MyDepartment
} from "../../../storage/departments";
import { MAX_PINNED_LINKS, PINNED_LINKS_KEY, readPinned, savePinned } from "../../../storage/links";
import { ALL_LINKS, LINK_GROUPS, type SchoolLink } from "../data/links";

const DRAG_TYPE = "text/wavoo-link";

function LinkCard({ link, draggable }: { link: SchoolLink; draggable?: boolean }) {
  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(DRAG_TYPE, link.id);
    event.dataTransfer.effectAllowed = "copy";
  };
  return (
    <a className="link-card" href={link.url} target="_blank" rel="noreferrer" draggable={draggable} onDragStart={onDragStart}>
      <span>{link.name}</span>
      {link.unofficial && <span className="link-badge">비공식</span>}
    </a>
  );
}

// 본전공·이중전공·부전공을 합쳐 최대 3개까지. 학과마다 홈페이지 박스가 하나씩 생긴다.
function DepartmentBanners() {
  const stored = useStorageValue<unknown>(MY_DEPARTMENTS_KEY, undefined);
  const mine = readMyDepartments(stored);
  const [adding, setAdding] = useState(false);
  const [role, setRole] = useState<DepartmentRole>("double");
  const [pickedId, setPickedId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const available = departments.filter((d) => !mine.some((m) => m.id === d.id));
  const full = mine.length >= MAX_MY_DEPARTMENTS;

  const add = (event: FormEvent) => {
    event.preventDefault();
    let next: MyDepartment | null = null;
    const known = departments.find((d) => d.id === pickedId);
    if (known) {
      next = { id: known.id, name: known.name, homepage: known.homepage, role };
    } else if (customName.trim() && /^https?:\/\//.test(customUrl.trim())) {
      next = { id: `custom:${Date.now()}`, name: customName.trim(), homepage: customUrl.trim(), role };
    }
    if (!next) return;
    void saveMyDepartments([...mine, next]);
    setAdding(false);
    setPickedId("");
    setCustomName("");
    setCustomUrl("");
  };

  return (
    <div className="my-depts">
      {mine.map((d) => (
        <div key={d.id} className="my-dept-row">
          <a className="my-dept" href={d.homepage} target="_blank" rel="noreferrer">
            <small>
              내 학과 홈페이지 · {ROLE_LABEL[d.role]}
            </small>
            <strong>{d.name}</strong>
          </a>
          {mine.length > 1 && (
            <button
              type="button"
              className="my-dept-remove"
              aria-label={`${d.name} 빼기`}
              onClick={() => void saveMyDepartments(mine.filter((m) => m.id !== d.id))}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {!adding && !full && (
        <button type="button" className="dept-add" onClick={() => setAdding(true)}>
          + 학과 추가 (이중전공·부전공)
        </button>
      )}

      {adding && (
        <form className="dept-form" onSubmit={add}>
          <label>
            구분
            <select value={role} onChange={(e) => setRole(e.target.value as DepartmentRole)}>
              {(Object.keys(ROLE_LABEL) as DepartmentRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          {available.length > 0 && (
            <label>
              학과 고르기
              <select value={pickedId} onChange={(e) => setPickedId(e.target.value)}>
                <option value="">직접 입력</option>
                {available.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!pickedId && (
            <>
              <label>
                학과 이름
                <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="예: 영어통번역학부" />
              </label>
              <label>
                홈페이지 주소
                <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://" inputMode="url" />
              </label>
              <p className="dept-note">직접 추가한 학과는 홈페이지 바로가기만 되고, 공지 알림은 아직 지원하지 않아요.</p>
            </>
          )}
          <div className="dept-form-actions">
            <button type="submit">추가</button>
            <button type="button" onClick={() => setAdding(false)}>
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// 아래 링크를 끌어다 놓아 자주 쓰는 링크를 모아두는 칸. 이 컴퓨터의 storage에만 저장된다.
function PinnedLinks() {
  const stored = useStorageValue<unknown>(PINNED_LINKS_KEY, []);
  const pinned = readPinned(stored);
  const [over, setOver] = useState(false);

  const links = pinned.map((id) => ALL_LINKS.find((l) => l.id === id)).filter((l): l is SchoolLink => Boolean(l));

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    const id = event.dataTransfer.getData(DRAG_TYPE);
    if (id && ALL_LINKS.some((l) => l.id === id) && !pinned.includes(id) && pinned.length < MAX_PINNED_LINKS) {
      void savePinned([...pinned, id]);
    }
  };

  return (
    <div className="links-group">
      <h3>
        나만의 링크{" "}
        <span className="pinned-count">
          {links.length}/{MAX_PINNED_LINKS}
        </span>
      </h3>
      <div
        className={`pinned-zone${over ? " is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {links.length === 0 ? (
          <p className="pinned-empty">아래 링크를 이곳으로 끌어다 놓으세요 (최대 {MAX_PINNED_LINKS}개)</p>
        ) : (
          <ul>
            {links.map((link) => (
              <li key={link.id} className="pinned-item">
                <LinkCard link={link} />
                <button
                  type="button"
                  className="pinned-remove"
                  aria-label={`${link.name} 빼기`}
                  onClick={() => void savePinned(pinned.filter((id) => id !== link.id))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 학교 사이트 모음. 누르면 새 탭으로 열려서 사이드바는 그대로 남아 있다.
export function LinksPage({ onBack }: { onBack: () => void }) {
  return (
    <section className="links-page">
      <header className="links-header">
        <button type="button" className="links-back" aria-label="메인으로 돌아가기" onClick={onBack}>
          ←
        </button>
        <h2>링크 모음집</h2>
      </header>

      <DepartmentBanners />
      <PinnedLinks />

      {LINK_GROUPS.map((group) => (
        <div key={group.title} className="links-group">
          <h3>{group.title}</h3>
          <ul>
            {group.links.map((link) => (
              <li key={link.id}>
                <LinkCard link={link} draggable />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
