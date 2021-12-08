import SVG from "components/SVG";
import { IPlaylist } from "typings";
import SkeletonImage from "assets/jpg/skeleton.jpg";

interface IPlaylistCardProps {
  playlist: IPlaylist;
  onClick?: () => void;
  onRemove: () => void;
}

const PlaylistCard: React.FC<IPlaylistCardProps> = ({
  playlist,
  onClick,
  onRemove,
}) => {
  const { name, songs } = playlist;

  const image = songs?.[0]?.thumbnail || SkeletonImage;

  return (
    <div className="w-full cursor-pointer group" onClick={onClick}>
      <div className="relative w-full overflow-hidden shadow-sm aspect-w-1 aspect-h-1 rounded-15">
        <img
          className="absolute object-cover duration-300 transform group-hover:scale-110"
          src={image}
        />
        <div className="absolute inset-0 hidden w-full h-full bg-black group-hover:block bg-opacity-30">
          <button
            className="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/4 top-1/2 hover:opacity-60"
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <SVG name="playlist/remove" className="w-2.5 h-2.5" />
          </button>
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 hover:opacity-60">
            <SVG name="playlist/play" className="w-5 h-5" />
          </div>
        </div>
      </div>
      <h2 className="mt-1 text-lg font-semibold text-center">{name}</h2>
    </div>
  );
};

export default PlaylistCard;
