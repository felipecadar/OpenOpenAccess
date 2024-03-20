/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useEffect, useState } from "react";
import HelpSection from "~/components/help_section";
import LegalSection from "~/components/legal_section";
import PaperView, { type paper_type } from "~/components/paper_view";
import { ignore_words, shuffle } from "~/components/utils";

import clsx from "clsx";

export default function Home() {
  const all_dogs = {
    regular: "/paperhoundlogo/PaperHound_regular.png",
    akward: "/paperhoundlogo/PaperHound_akward.png",
    angry: "/paperhoundlogo/PaperHound_angry.png",
    cool: "/paperhoundlogo/PaperHound_cool.png",
    curious: "/paperhoundlogo/PaperHound_curious.png",
    happy: "/paperhoundlogo/PaperHound_happy.png",
  };

  const [ogdata, ogsetData] = useState<paper_type[]>([]);
  const [data, setData] = useState<paper_type[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(true);
  const [keyWords, setKeyWords] = useState<string[]>([]);
  const [isLegalSectionCollapsed, setIsLegalSectionCollapsed] = useState(false);
  const [dog_figure, setDogFigure] = useState<string>(
    "/paperhoundlogo/PaperHound_regular.png",
  );
  // tuple of [term, count]
  const [cutTerms, setCutTerms] = useState<[string, number][]>([]);
  const [scissorsPuss, setScissorsPuss] = useState(true); 
  const [showKeyWords, setShowKeyWords] = useState(false);

  // focus on search input when page loads
  useEffect(() => {
    document.getElementById("search")?.focus();
  }, []);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    // set it as a query parameter
    const encoded_query = encodeURIComponent(event.target.value);
    window.history.pushState({}, "", `/?search=${encoded_query}`);
  }

  // load the search from the query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) {
      setSearch(searchParam);
      // make the search input focused
      document.getElementById("search")?.focus();
      searchFilter();
    }
  }, [ogdata]);

  useEffect(() => {
    fetch("/papers_info.json")
      .then((response) => response.json() as Promise<paper_type[]>)
      // .then(data => setData(data))
      .then((data) => {
        // filter empty data ( without title or authors or abstract )
        let filteredData = data.filter(
          (paper) => paper.title && paper.authors && paper.abstract,
        );
        // shuffle the data
        filteredData = shuffle(filteredData);
        ogsetData(filteredData);
        setData(filteredData);
      })
      .then(() => {
        // if there is a search query, run the search filter
        if (search.length > 0) {
          searchFilter();
          console.log("search");
        } else {
          console.log("no search");
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    searchFilter();
    const encoded_query = encodeURIComponent(search);
    window.history.pushState({}, "", `/?search=${encoded_query}`);
  }, [search]);

  function searchFilter() {
    // t+ to search for the title including the search term
    // t- to search for the title excluding the search term

    // a+ to search for the abstract including the search term
    // a- to search for the abstract excluding the search term

    // au+ to search for the authors including the search term
    // au- to search for the authors excluding the search term

    // separate all terms by space

    const valid_inits = ["t+", "t-", "a+", "a-", "au+", "au-"];

    // reset data to original data
    let filterData = ogdata;
    const _keyWords = [] as string[];

    const searchTerms = search
      .trim()
      .split(" ")
      .filter((term) => term.length > 0);
    searchTerms.forEach((term) => {
      // if starts with t, a, au followed by + or -, make sure there is a term after it
      if (
        valid_inits.includes(term.toLowerCase().slice(0, 2)) &&
        term.length < 3
      ) {
        // skip this term
        return;
      }

      if (term.toLowerCase().startsWith("t+")) {
        const searchTerm = term.replace("t+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("t-")) {
        const searchTerm = term.replace("t-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("a+")) {
        const searchTerm = term.replace("a+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("a-")) {
        const searchTerm = term.replace("a-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("au+")) {
        const searchTerm = term.replace("au+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.authors.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("au-")) {
        const searchTerm = term.replace("au-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.authors.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else {
        _keyWords.push(term);
        filterData = filterData.filter(
          (paper) =>
            paper.title.toLowerCase().includes(term.toLowerCase()) ||
            paper.authors.toLowerCase().includes(term.toLowerCase()) ||
            paper.abstract.toLowerCase().includes(term.toLowerCase()),
        );
      }
    });

    setKeyWords(_keyWords);
    setData(filterData);
    setDogFigure(all_dogs.regular);

    if (searchTerms.length > 0) {
      if (filterData.length == 1) {
        setDogFigure(all_dogs.happy);
      } else if (filterData.length == 0) {
        setDogFigure(all_dogs.angry);
      } else if (filterData.length > 20) {
        setDogFigure(all_dogs.curious);
      }
    }
  }

  useEffect(
    () => {
      // check the most common words in the search
      const title_words = new Map<string, number>();
      const _ignore_words = ignore_words.slice();
      // add the search terms to the ignore words
      _ignore_words.push(...keyWords.map((word) => word.toLowerCase()));

      for (const paper of data) {
        const title = paper.title.toLowerCase();
        const words = title
          .split(" ")
          .filter((word) => !_ignore_words.includes(word))
          .filter((word) => word.length > 1);
        for (const word of words) {
          if (title_words.has(word)) {
            title_words.set(word, title_words.get(word)! + 1);
          } else {
            title_words.set(word, 1);
          }
        }
      }

      const sorted_title_words = new Map(
        [...title_words.entries()].sort((a, b) => b[1] - a[1]),
      );

      const cut_terms = Array.from(sorted_title_words.entries()).slice(0, 5);
      setCutTerms(cut_terms);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  return (
    <>
      <Head>
        <title>PaperHound</title>
        <meta name="description" content="Open Acess made easy." />
        <link rel="icon" href="/Mini.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <div className="">
          <div className="flex flex-row flex-wrap items-end justify-center gap-4 pb-4 pt-20">
            <img src={dog_figure} className="w-28" />
            <h1 className=" font-serif text-6xl font-bold  text-sky-900 ">
              PaperHound
            </h1>
          </div>
        </div>

        {/* make a instruction button fixed on the top right corner in a shape of a little circle with an interrogation */}
        <div className="fixed right-4 top-4">
          <button
            className="rounded-full bg-slate-200 px-4 py-2"
            onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
          >
            ?
          </button>
        </div>

        {/* make a nice header with the using instructions*/}
        {/* make it colapsable */}

        {/* make in input box */}
        {/* <div className="flex flex-row flex-wrap items-center justify-center gap-4 pt-4"> */}
        <div className="w-screen flex-col items-center justify-center">
          <div className="flex w-screen items-center justify-center">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200"
              onClick={() => setShowKeyWords(!showKeyWords)}
            >
              {!showKeyWords ?
               <img src="/paperhound_choice.png" /> :
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              }

            </button>
            <input
              type="text"
              id="search"
              placeholder="Search"
              className=" mx-5 w-3/4 max-w-96 rounded-md border-2 border-slate-300 px-4 py-2 focus:ring-sky-900"
              value={search}
              onChange={handleSearchChange}
            />

            {/* little circle button */}
          </div>

          {showKeyWords && (
            // add a border
            <div className="flex flex-wrap items-center justify-center m-4 ">
              <div className="flex flex-wrap bg-slate-200 rounded-full gap-4 items-center justify-center pr-2">

              <button className={clsx(
                "rounded-full bg-slate-200 h-14 w-14"
              )}
                onClick={() => setScissorsPuss(!scissorsPuss)}
              >
                {scissorsPuss ? 
                <img src="/scissorpuss.png" className="" /> :
                <img src="/rockraven.png" className="" />
                }
                  
              </button>
              {cutTerms.map(([term, count], index) => (
                // <p key={index}>{`${term} : ${count}`}</p>
                <div
                  // show a help message when hovering over the term depending on the scissorsPuss
                  title={
                    scissorsPuss
                      ? `Remove ${term} to the search`
                      : `Add ${term} from the search`
                  }
                  key={index}
                  onClick={() => {
                    const operation = scissorsPuss ? "t-" : "t+";
                    setSearch(
                      `${search} ${operation}${term.replace(/ /g, "_")}`,
                    );
                  }}
                  className={clsx(
                    "gap- flex cursor-pointer items-center justify-center rounded-full px-4 py-2 h-10",
                    scissorsPuss ? "bg-sky-900 text-slate-200" : "bg-white text-sky-900",
                  )}
                >
                  <p>{term}</p>
                </div>
              ))}
            </div>
            </div>

          )}
        </div>

        {/* make a little comentary about where the papers came from */}
        {/* make a fixed footer */}
        {!isLegalSectionCollapsed && (
          <div className="fixed bottom-0 w-full bg-slate-200 p-4">
            {/* add a little x to close it on the top right corner */}
            <button
              className="float-right rounded-full bg-slate-300 px-4 py-2"
              onClick={() =>
                setIsLegalSectionCollapsed(!isLegalSectionCollapsed)
              }
            >
              Close
            </button>
            <LegalSection />
          </div>
        )}

        {/* Collapsible section */}
        <div className="flex flex-col items-start justify-center gap-4 pt-4">
          {!isSectionCollapsed && <HelpSection />}
        </div>

        {/* make a nice list of papers */}

        <div className="container flex flex-col items-center justify-center gap-12 px-4 pb-28 ">
          {search.length > 0 && (
            <>
              <p className="pt-4 ">{`Found ${data.length} out of ${ogdata.length} papers`}</p>
              {data.slice(0, 200).map((paper, index) => (
                <PaperView paper={paper} key={index} />
              ))}
            </>
          )}
        </div>
      </main>
    </>
  );
}
