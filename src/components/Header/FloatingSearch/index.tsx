import { Fragment, PropsWithChildren, useState } from "react";
import { Dialog as DialogUI, Transition } from "@headlessui/react";
import SVG from "components/SVG";
import { useDebounced } from "hooks/useDebounced";
import axios, { AxiosResponse } from "axios";
import { YOUTUBE_API_KEY_1, YOUTUBE_API_KEY_2 } from "constants/env";
import { ISong, IYoutubeSearchItem, IYoutubeSearchResponse } from "typings";
import { useDispatch } from "react-redux";
import { enqueueSongToPlaylist } from "redux/slices/playlist";
import { randomId } from "util/random";
import Spinner from "components/Spinner";
import { htmlDecode } from "util/htmlDecode";
import { toast } from "react-toastify";
import useLocalStorage from "hooks/useLocalStorage";

interface ILoginDialogProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const FloatingSearch = (
  props: PropsWithChildren<ILoginDialogProps>,
): JSX.Element => {
  const { className = "", open, onClose } = props;

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <DialogUI as="div" className="fixed inset-0 z-100" onClose={handleClose}>
        <div className="min-h-screen px-2 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogUI.Overlay
              className="fixed inset-0 "
              style={{ backgroundColor: "#13131344" }}
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen " aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              className={`
              inline-block mt-8  text-left align-middle transition-all transform  
              w-full max-w-sm 
            `}
            >
              <MainContent onClose={onClose} />
            </div>
          </Transition.Child>
        </div>
      </DialogUI>
    </Transition>
  );
};

export default FloatingSearch;

const MainContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  var [apiKey, setApiKey] = useLocalStorage("YoutubeAPIKey", YOUTUBE_API_KEY_1);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { searchResults, inputText, setInputText } =
    useDebounced<IYoutubeSearchItem>(async function searchYoutubeAPI(text) {
      if (!text) return [];
      try {
        const response: AxiosResponse<IYoutubeSearchResponse> = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${text}&type=video&key=${apiKey}`,
        );
        setLoading(false);
        return response?.data?.items;
      } catch (error) {
        toast.error("Something was wrong!. Please refresh the page.", {
          autoClose: false,
        });
        setApiKey(
          apiKey === YOUTUBE_API_KEY_1 ? YOUTUBE_API_KEY_2 : YOUTUBE_API_KEY_1,
        );
        setLoading(false);
        return [];
      }
    });

  return (
    <>
      <Searchbox
        loading={loading}
        inputText={inputText}
        onChange={text => {
          if (!loading) setLoading(true);
          setInputText(text);
        }}
      />
      <div className="flex flex-col w-full gap-1 mt-2">
        {searchResults.result?.map(item => (
          <SearchResultItem
            key={item.id.videoId}
            item={item}
            onClick={() => {
              onClose();
              setInputText("");
              const song: ISong = {
                _id: randomId(),
                name: htmlDecode(item.snippet.title) || "",
                author: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.medium.url,
                youtubeURL: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              };
              dispatch(enqueueSongToPlaylist(song));
            }}
          />
        ))}
      </div>
    </>
  );
};

const SearchResultItem: React.FC<{
  item: IYoutubeSearchItem;
  onClick: () => void;
}> = ({ item, onClick }) => {
  const {
    id,
    snippet: { thumbnails, title, channelTitle },
  } = item || {};
  return (
    <div
      className="bg-white hover:bg-alice-blue items-center cursor-pointer px-1.5 py-1 gap-1 w-full rounded-8 grid"
      style={{ gridTemplateColumns: "32px 1fr 24px" }}
      onClick={() => onClick()}
    >
      <SVG name="common/dvd" />
      <div>
        <p className="text-lg font-semibold text-black">{htmlDecode(title)}</p>
        <p className="text-xs text-gray">{channelTitle}</p>
      </div>
      <SVG name="common/add" />
    </div>
  );
};

const Searchbox: React.FC<{
  loading: boolean;
  inputText: string;
  onChange: (text: string) => void;
}> = ({ onChange, inputText, loading }) => {
  return (
    <label
      className="bg-white w-full grid items-center pr-1.5 pl-0.5 rounded-8 py-1.5 shadow-md"
      style={{ gridTemplateColumns: "40px 1fr" }}
    >
      {loading && inputText ? (
        <Spinner size={24} className="w-2.5 h-2.5 ml-1" />
      ) : (
        <SVG name="common/search" className="w-2.5 h-2.5 ml-1" />
      )}
      <input
        value={inputText}
        className="w-full ml-1 text-lg font-medium outline-none bg-none "
        autoFocus
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
};
