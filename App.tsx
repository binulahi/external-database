import React, { useState, useEffect, useMemo } from 'react';
import opportunitiesData from './data/opportunities.json';
import logo from './logo.jpeg';

interface Opportunity {
  Title: string;
  Description: string;
  "External/Penn Reviewed": string;
  Deadline: string;
  Tags: string[];
}

// Helper to convert URLs in text to clickable links
const parseDescription = (desc: string) => {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  if (!desc.match(regex)) {
    return desc;
  }
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(desc)) !== null) {
    parts.push(desc.substring(lastIndex, match.index));
    parts.push(
      <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  parts.push(desc.substring(lastIndex));

  return <>{parts}</>;
};

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpportunities(opportunitiesData as Opportunity[]);
  }, []);

  const row1Tags = [
    'Basic Science', 
    'Clinical', 
    'Global', 
    'Health Disparity & Equity', 
    'Translational', 
    'Other'
  ];
  
  const row2Tags = [
    'Summer/Short-term Fellowship', 
    'Year Out Fellowship', 
    'Individual Project Funding', 
    'Travel Grant'
  ];

  // Filter opportunities based on search query and selected tags
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // 1. Tag Filtering: if any tags are selected, the opp must have ALL of them (AND logic).
      if (selectedTags.size > 0) {
        const hasAllTags = Array.from(selectedTags).every(t => opp.Tags.includes(t));
        if (!hasAllTags) return false;
      }

      // 2. Search Query Filtering
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.Title.toLowerCase().includes(q);
        const matchesDesc = opp.Description.toLowerCase().includes(q);
        const matchesTags = opp.Tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="FCoM Logo" className="logo" />
        </div>
        <div className="header-text">
          <h1 className="title">External Research Opportunities for FCoM Students</h1>
          <p className="subtitle">A searchable directory of opportunities for medical students.</p>
        </div>
      </header>

      <div className="controls">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by title, description, or keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="tag-filters-container">
          <div className="tag-filters row1">
            {row1Tags.map(tag => (
              <button 
                key={tag}
                className={`filter-tag r1 ${selectedTags.has(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="tag-filters row2">
            {row2Tags.map(tag => (
              <button 
                key={tag}
                className={`filter-tag r2 ${selectedTags.has(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="opportunities-table">
          <thead>
            <tr>
              <th className="col-title">Opportunity</th>
              <th className="col-deadline">Deadline</th>
              <th className="col-tags">Tags</th>
              <th className="col-desc">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((opp, idx) => (
                <tr key={idx}>
                  <td className="col-title font-bold text-main">{opp.Title}</td>
                  <td className="col-deadline">
                    <span className="deadline-badge">{opp.Deadline}</span>
                  </td>
                  <td className="col-tags">
                    <div className="tags-container">
                      {opp.Tags.map((tag, tagIdx) => {
                        const isR2 = row2Tags.includes(tag);
                        return (
                          <span className={`tag ${isR2 ? 'tag-r2' : 'tag-r1'}`} key={tagIdx}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="col-desc">
                    <div className="desc-content">
                      {parseDescription(opp.Description)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-results">
                  No opportunities match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;