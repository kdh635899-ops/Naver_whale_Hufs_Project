import "./LinksPage.css";
import { DEFAULT_DEPARTMENT_ID } from "../../../constants/department";
import departments from "../../../constants/departments.json";
import { LINK_GROUPS, type LinkGroup } from "../data/links";

function buildGroups(): LinkGroup[] {
  // 학과 홈페이지는 학교 공통 목록이 아니라 선택한 학과에 따라 달라지므로 맨 위에 따로 둔다.
  const department = departments.find((d) => d.id === DEFAULT_DEPARTMENT_ID);
  const mine: LinkGroup[] = department
    ? [{ title: "내 학과", links: [{ id: `dept-${department.id}`, name: department.name, url: department.homepage }] }]
    : [];
  return [...mine, ...LINK_GROUPS];
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

      {buildGroups().map((group) => (
        <div key={group.title} className="links-group">
          <h3>{group.title}</h3>
          <ul>
            {group.links.map((link) => (
              <li key={link.id}>
                <a className="link-card" href={link.url} target="_blank" rel="noreferrer">
                  <span className="link-icon" aria-hidden="true">
                    {link.name.charAt(0)}
                  </span>
                  <span className="link-name">{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
