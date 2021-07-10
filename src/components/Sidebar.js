import { Link, useStaticQuery, graphql } from 'gatsby';
import React from 'react';

export default function Sidebar({ paths }) {
  const data = useStaticQuery(graphql`
    query SidebarQuery {
      site {
        siteMetadata {
          sidebarSections {
            key
            name
          }
        }
      }
    }
  `);

  const sidebarSections = [...data.site.siteMetadata.sidebarSections].map((v) => ({ ...v }));

  paths.edges.forEach((v) => {
    const { path, title, type } = v.node.childMarkdownRemark.frontmatter;

    const section = sidebarSections.find((sec) => sec.key === type);
    if (section) {
      const sectionLinks = section.links || (section.links = []);
      sectionLinks.push({ path, title });
    }
  });

  return (
    <aside className='sidebar'>
      {sidebarSections.map(
        (section) =>
          section.links && (
            <div key={section.key} className={section.name ? '' : 'top-level'}>
              {section.name && <p>{section.name}</p>}
              <ul>
                {section.links.map((v) => {
                  const { path, title } = v;
                  return (
                    <li key={path}>
                      <Link to={path} activeClassName='link__active'>
                        {title || path}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
      )}
    </aside>
  );
}
