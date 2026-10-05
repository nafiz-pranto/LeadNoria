/**
 * Contact Source Graph Builder (Phase 22)
 *
 * Constructs a compact evidence graph linking target website -> observed pages ->
 * discovered contacts and people, and person-contact associations.
 *
 * NON-NEGOTIABLE SAFETY:
 * - NO raw HTML in graph.
 * - Compact structured node and edge representations only.
 */

import type {
  CanonicalContact,
  CanonicalPerson,
  ContactSourceGraph,
  SourceGraphNode,
  SourceGraphEdge
} from './types.ts';

export function buildContactSourceGraph(
  targetUrl: string,
  arg2: any,
  arg3?: any,
  arg4?: any
): ContactSourceGraph {
  let pagesVisited: string[] = [];
  let contacts: CanonicalContact[] = [];
  let people: CanonicalPerson[] = [];

  if (Array.isArray(arg2) && arg2.length > 0 && typeof arg2[0] === 'string') {
    pagesVisited = arg2;
    contacts = Array.isArray(arg3) ? arg3 : [];
    people = Array.isArray(arg4) ? arg4 : [];
  } else {
    contacts = Array.isArray(arg2) ? arg2 : [];
    people = Array.isArray(arg3) ? arg3 : [];
    const pagesSet = new Set<string>();
    if (targetUrl) pagesSet.add(targetUrl);
    for (const c of contacts) {
      if (c.sourcePages) c.sourcePages.forEach(p => p && pagesSet.add(p));
      if (c.sourceUrl) pagesSet.add(c.sourceUrl);
    }
    for (const p of people) {
      if (p.sourcePages) p.sourcePages.forEach(pg => pg && pagesSet.add(pg));
    }
    pagesVisited = Array.from(pagesSet);
  }

  const nodes: SourceGraphNode[] = [];
  const edges: SourceGraphEdge[] = [];
  const addedNodeIds = new Set<string>();

  // 1. Root Website Node
  const websiteId = 'node_root_website';
  nodes.push({
    id: websiteId,
    type: 'WEBSITE',
    label: targetUrl,
    url: targetUrl
  });
  addedNodeIds.add(websiteId);

  // 2. Page Nodes & Website -> Page Edges
  for (const pageUrl of pagesVisited) {
    if (!pageUrl || typeof pageUrl !== 'string') continue;
    const pageId = `node_page_${pageUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(-32)}`;
    if (!addedNodeIds.has(pageId)) {
      nodes.push({
        id: pageId,
        type: 'PAGE',
        label: pageUrl,
        url: pageUrl
      });
      addedNodeIds.add(pageId);

      edges.push({
        fromId: websiteId,
        toId: pageId,
        relationship: 'HOSTS_PAGE'
      });
    }
  }

  // Helper to find closest page node
  const getPageNodeId = (pageUrl?: string): string => {
    const clean = (pageUrl || '').replace(/[^a-zA-Z0-9]/g, '_').slice(-32);
    return `node_page_${clean}`;
  };

  // 3. Contact Nodes & Page -> Contact Edges
  for (const contact of contacts) {
    const contactNodeId = `node_contact_${contact.contactId}`;
    if (!addedNodeIds.has(contactNodeId)) {
      nodes.push({
        id: contactNodeId,
        type: 'CONTACT',
        label: `${contact.contactType}: ${contact.normalizedValue}`
      });
      addedNodeIds.add(contactNodeId);

      const pages = (contact.sourcePages && contact.sourcePages.length > 0)
        ? contact.sourcePages
        : (contact.sourceUrl ? [contact.sourceUrl] : []);

      for (const pageUrl of pages) {
        if (!pageUrl) continue;
        const pageNodeId = getPageNodeId(pageUrl);
        if (addedNodeIds.has(pageNodeId)) {
          edges.push({
            fromId: pageNodeId,
            toId: contactNodeId,
            relationship: 'EXPOSES_CONTACT'
          });
        }
      }
    }
  }

  // 4. Person Nodes & Page -> Person Edges
  for (const person of people) {
    const personNodeId = `node_person_${person.personId}`;
    if (!addedNodeIds.has(personNodeId)) {
      nodes.push({
        id: personNodeId,
        type: 'PERSON',
        label: `${person.fullName} (${person.jobTitle || 'Team'})`
      });
      addedNodeIds.add(personNodeId);

      for (const pageUrl of person.sourcePages) {
        const pageNodeId = getPageNodeId(pageUrl);
        if (addedNodeIds.has(pageNodeId)) {
          edges.push({
            fromId: pageNodeId,
            toId: personNodeId,
            relationship: 'EXPOSES_PERSON'
          });
        }
      }

      // 5. Person -> Contact Association Edges
      for (const emailRef of person.emailRefs) {
        const contactNodeId = `node_contact_${emailRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: 'ASSOCIATED_WITH'
          });
        }
      }

      for (const phoneRef of person.phoneRefs) {
        const contactNodeId = `node_contact_${phoneRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: 'ASSOCIATED_WITH'
          });
        }
      }

      for (const socialRef of person.socialRefs) {
        const contactNodeId = `node_contact_${socialRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: 'ASSOCIATED_WITH'
          });
        }
      }
    }
  }

  return { nodes, edges };
}
