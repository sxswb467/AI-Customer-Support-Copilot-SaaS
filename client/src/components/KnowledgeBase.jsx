import { getKbInsight } from "../demoPresentation";

export function KnowledgeBase({ docs, selectedTicket }) {
  return (
    <section className="knowledge-panel panel-surface">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Knowledge base</span>
          <h2>Recommended guidance</h2>
        </div>
        <p>
          {selectedTicket
            ? `Support notes aligned to ${selectedTicket.subject.toLowerCase()}.`
            : "Pick a ticket to see the most relevant guidance."}
        </p>
      </div>

      <div className="article-list">
        {docs.length ? (
          docs.map((doc, index) => {
            const insight = getKbInsight(doc, index);

            return (
              <article
                key={doc.id}
                className={`kb-article ${index === 0 ? "is-featured" : ""}`}
              >
                <div className="kb-article-header">
                  <div className="kb-article-meta">Playbook {index + 1}</div>
                <div className="tag-list">
                  {doc.tags.split(",").map((tag) => (
                    <span key={tag.trim()} className="tag-chip">
                      {tag.trim()}
                    </span>
                  ))}
                  <span className="tag-chip tag-chip-accent">{insight.relevance}% match</span>
                </div>
                </div>
                <h3>{doc.title}</h3>
                <p>{doc.body}</p>
                <div className="kb-action-line">
                  <span>Suggested next move</span>
                  <strong>{insight.action}</strong>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <strong>No documentation available</strong>
            <p>There are no knowledge base articles configured for this tenant yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
