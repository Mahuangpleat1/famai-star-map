import { Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getLegalUniverseNodeById,
  getLegalUniverseSystemById
} from "../../data/legalUniverseData";
import { listFavorites, loadAllNotes, type NodeNote } from "./legalUniverseStorage";
import { useFocusTrap } from "./hooks/useFocusTrap";
import type { LegalUniverseNode } from "./types";
import "./css/law-universe-lab-panels.css";

interface LawUniverseFavoritesPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectNode: (id: string) => void;
}

export function useFavoritesRefresh() {
  const [version, setVersion] = useState(0);
  return { version, refresh: () => setVersion((v) => v + 1) };
}

interface FavoritesData {
  favorites: Array<{ node: LegalUniverseNode; note: NodeNote }>;
  notesOnly: Array<{ node: LegalUniverseNode; note: NodeNote }>;
}

function loadData(): FavoritesData {
  const all = loadAllNotes();
  const favorites: Array<{ node: LegalUniverseNode; note: NodeNote }> = [];
  const notesOnly: Array<{ node: LegalUniverseNode; note: NodeNote }> = [];
  for (const [nodeId, note] of Object.entries(all)) {
    const node = getLegalUniverseNodeById(nodeId);
    if (!node) continue;
    if (note.favorited) {
      favorites.push({ node, note });
    } else if (note.note.trim().length > 0) {
      notesOnly.push({ node, note });
    }
  }
  favorites.sort((a, b) => b.note.updatedAt - a.note.updatedAt);
  notesOnly.sort((a, b) => b.note.updatedAt - a.note.updatedAt);
  return { favorites, notesOnly };
}

export function LawUniverseFavoritesPanel({ open, onClose, onSelectNode }: LawUniverseFavoritesPanelProps) {
  const [data, setData] = useState<FavoritesData>({ favorites: [], notesOnly: [] });
  const panelRef = useRef<HTMLDivElement | null>(null);
  // 完整焦点陷阱
  useFocusTrap(panelRef, open, { onEscape: onClose });

  useEffect(() => {
    if (open) {
      setData(loadData());
    }
  }, [open]);

  const total = useMemo(() => data.favorites.length + data.notesOnly.length, [data]);

  if (!open) return null;

  return (
    <div className="law-universe-favorites" data-testid="law-universe-favorites" role="dialog" aria-modal="true" aria-label="我的收藏与笔记">
      <button type="button" className="law-universe-favorites__scrim" onClick={onClose} aria-label="关闭收藏夹" />
      <div ref={panelRef} className="law-universe-favorites__panel">
        <header className="law-universe-favorites__head">
          <Star aria-hidden="true" size={16} strokeWidth={1.8} />
          <span className="law-universe-favorites__title">我的收藏 / 笔记</span>
          <span className="law-universe-favorites__count">{total}</span>
          <button type="button" className="law-universe-favorites__close" onClick={onClose} aria-label="关闭" data-testid="law-universe-favorites-close">
            <X aria-hidden="true" size={13} strokeWidth={1.8} />
          </button>
        </header>

        {total === 0 ? (
          <p className="law-universe-favorites__empty">
            还没有任何收藏或笔记。在任何节点详情面板点 ⭐ 收藏,或在底部笔记框记录想法 —— 都只保存在你的浏览器。
          </p>
        ) : (
          <div className="law-universe-favorites__list">
            {data.favorites.length > 0 ? (
              <section>
                <h3>收藏节点 ({data.favorites.length})</h3>
                <ul>
                  {data.favorites.map(({ node }) => {
                    const system = getLegalUniverseSystemById(node.systemId)?.title ?? "中国法学体系";
                    return (
                      <li key={`fav-${node.id}`}>
                        <button type="button" onClick={() => onSelectNode(node.id)} data-testid={`law-universe-favorites-item-${node.id}`}>
                          <span className="law-universe-favorites__item-title">{node.title}</span>
                          <span className="law-universe-favorites__item-meta">{system} · L{node.level}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
            {data.notesOnly.length > 0 ? (
              <section>
                <h3>有笔记的节点 ({data.notesOnly.length})</h3>
                <ul>
                  {data.notesOnly.map(({ node, note }) => {
                    const system = getLegalUniverseSystemById(node.systemId)?.title ?? "中国法学体系";
                    return (
                      <li key={`note-${node.id}`}>
                        <button type="button" onClick={() => onSelectNode(node.id)} data-testid={`law-universe-favorites-item-${node.id}`}>
                          <span className="law-universe-favorites__item-title">{node.title}</span>
                          <span className="law-universe-favorites__item-meta">{system} · {new Date(note.updatedAt).toLocaleDateString()}</span>
                          <span className="law-universe-favorites__item-snip">{note.note.slice(0, 80)}{note.note.length > 80 ? "..." : ""}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export { listFavorites };
