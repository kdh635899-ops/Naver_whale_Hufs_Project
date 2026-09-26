import "./LinksPage.css";
import { DEFAULT_DEPARTMENT_ID } from "../../../constants/department";
import departments from "../../../constants/departments.json";
import { LINK_GROUPS } from "../data/links";

// 학교 사이트 모음. 누르면 새 탭으로 열려서 사이드바는 그대로 남아 있다.
export function LinksPage({ onBack }: { onBack: () => void }) {
  // 학과 홈페이지는 학교 공통 목록이 아니라 선택한 학과에 따라 달라지므로 맨 위에 하나만 둔다.
  const department = departments.find((d) => d.id === DEFAULT_DEPARTMENT_ID);

  return (
    <section className="links-page">
      <header className="links-header">
        <button type="button" className="links-back" aria-label="메인으로 돌아가기" onClick={onBack}>
          ←
        </button>
        <h2>링크 모음집</h2>
      </header>

      {department && (
        <a className="my-dept" href={department.homepage} target="_blank" rel="noreferrer">
          <small>내 학과 홈페이지</small>
          <strong>{department.name}</strong>
        </a>
      )}

      {LINK_GROUPS.map((group) => (
        <div key={group.title} className="links-group">
          <h3>{group.title}</h3>
          <ul>
            {group.links.map((link) => (
              <li key={link.id}>
                <a className="link-card" href={link.url} target="_blank" rel="noreferrer">
                  <span>{link.name}</span>
                  {link.unofficial && <span className="link-badge">비공식</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
