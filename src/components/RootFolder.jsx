import React, { useContext, useState, useEffect, useCallback } from "react";
import { States } from "../App";
import { Button } from "@/components/ui/button";
import ShareFile from "./ShareFile";

import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  Share2,
  Trash2,
  File,
  Folder,
  X,
} from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddFolder from "./AddFolder";
import AddFile from "./AddFile";
import { API_BASE_URL } from "../lib/api";
import DeleteFolder from "./DeleteFolder";
import DeleteFile from "./DeleteFile";
import { useBreakpoint } from "./UseBreakpoint";

export default function RootFolder() {
  const { rootFolder, Auth } = useContext(States);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [FileDialogOpen, setFileDialogOpen] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [activeFolder, setActiveFolder] = useState(rootFolder.id);
  const breakpoint = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "--";
    const kb = bytes / 1024;
    if (kb < 1) {
      return "< 1 KB";
    } else if (kb < 1000) {
      return `${Math.round(kb * 10) / 10} KB`;
    } else {
      const mb = kb / 1024;
      return `${Math.round(mb * 10) / 10} MB`;
    }
  };
  const [folderHiearchy, setFolderHiearchy] = useState({
    byFolderId: {
      [rootFolder.id]: {
        name: rootFolder.name,
        parentId: null,
        childIds: [],
        fileChildIds: [],
        isExpanded: false,
        childrenLoaded: false,
        Path: `${rootFolder.id}`,
        createdTime: formatDate(rootFolder.createdAt),
      },
    },
    byFileId: {},
  });
  const handleArrowState = (folderId) => {
    setFolderHiearchy((prevState) => {
      const newState = { ...prevState };
      newState.byFolderId = {
        ...newState.byFolderId,
        [folderId]: {
          ...newState.byFolderId[folderId],
          isExpanded: !newState.byFolderId[folderId].isExpanded,
        },
      };
      return newState;
    });
  };
  const handleOpenedState = (fileId) => {
    setFolderHiearchy((prevState) => {
      const newState = { ...prevState };
      newState.byFileId = {
        ...newState.byFileId,
        [fileId]: {
          ...newState.byFileId[fileId],
          Opened: !newState.byFileId[fileId].Opened,
        },
      };
      return newState;
    });
  };
  const handleFileDetails = (fileId) => {
    const file = folderHiearchy.byFileId[fileId];
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card rounded-lg p-6 text-center shadow-lg">
            <div className="border-primary mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-lg font-medium">Downloading File...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="text-primary fixed inset-0 z-50 cursor-auto bg-black/70 text-sm">
        <div
          className={`bg-secondary fixed right-0 flex h-full w-full transform flex-col justify-between p-6 transition-all duration-300 ease-out sm:w-[70%] md:w-[60%] lg:w-[45%] xl:w-[30%] ${file.Opened ? "translate-x-0" : "translate-x-full"} `}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              File Information
            </h3>
            <div className="mt-6 flex flex-col gap-2">
              <p>
                <span className="font-bold">Name :</span> {file.name}
              </p>
              <p>
                <span className="font-bold">Size :</span> {file.size}
              </p>
              <p>
                <span className="font-bold">Created :</span> {file.createdTime}
              </p>
            </div>
            <X
              className="absolute top-6 right-10 h-4 w-4 cursor-pointer hover:text-[#52b2f9]"
              onClick={() => handleOpenedState(fileId)}
            />
          </div>
          <div className="grid grid-flow-col gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleOpenedState(fileId)}
            >
              Close
            </Button>
            <AlertDialog
              open={deleteFileDialogOpen}
              onOpenChange={setDeleteFileDialogOpen}
            >
              <AlertDialogTrigger asChild className="text-xs">
                <Button variant="outline" className="cursor-pointer">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <DeleteFile
                onClose={() => setFileDialogOpen(false)}
                fileId={fileId}
                setFolderHiearchy={setFolderHiearchy}
                userId={Auth.userId}
              />
            </AlertDialog>
            <ShareFile fileId={fileId} userId={Auth.userId} />
            <Button
              className="cursor-pointer"
              onClick={(e) => {
                setLoading(true);
                e.stopPropagation();
                fetch(
                  `${API_BASE_URL}/user/${Auth.userId}/Folders/Files/download/${fileId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`Download failed: ${response.status}`);
                    }
                    setLoading(false);
                    return response.blob();
                  })
                  .then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                  })
                  .catch((error) => {
                    console.error("Download error:", error);
                    setLoading(false);
                    alert("Failed to download file. Please try again.");
                  });
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  };
  const LoadChildren = useCallback(
    (folderId) => {
      if (!folderId || !Auth?.userId) return;
      if (folderHiearchy.byFolderId[folderId]?.childrenLoaded) return;
      setLoadingFolders(true);
      fetch(`${API_BASE_URL}/user/${Auth.userId}/Folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Error occurred while getting subfolders");
          return res.json();
        })
        .then((data) => {
          setLoadingFolders(false);
          setFolderHiearchy((prevState) => {
            const newState = { ...prevState };
            newState.byFolderId[folderId].childIds = data.childFolders.map(
              (child) => child.id,
            );
            newState.byFolderId[folderId].fileChildIds = data.files.map(
              (child) => child.id,
            );
            newState.byFolderId[folderId].childrenLoaded = true;
            data.childFolders.forEach((child) => {
              newState.byFolderId[child.id] = {
                name: child.name,
                parentId: folderId,
                childIds: [],
                fileChildIds: [],
                isExpanded: false,
                childrenLoaded: false,
                Path: newState.byFolderId[folderId].Path + " > " + child.id,
                createdTime: formatDate(child.createdAt),
              };
            });
            data.files.forEach((child) => {
              newState.byFileId[child.id] = {
                name: child.name,
                parentId: folderId,
                Path: newState.byFolderId[folderId].Path + " > " + child.id,
                createdTime: formatDate(child.createdAt),
                uploadPath: child.uploadPath,
                size: formatFileSize(child.size),
                Opened: false,
              };
            });

            return newState;
          });
        })
        .catch((error) => console.error(error));
    },
    [Auth?.userId, token, folderHiearchy],
  );
  const showChildren = (folderId) => {
    if (
      !folderHiearchy.byFolderId[folderId] ||
      !folderHiearchy.byFolderId[folderId].childIds
    ) {
      return null;
    }
    return (
      <>
        {folderHiearchy.byFolderId[folderId].childIds.map((childId) => (
          <div key={childId} className="ml-4 w-auto flex-col border-l pr-0">
            {" "}
            <div
              className={`mt-2 flex cursor-pointer items-center gap-2 truncate p-1 text-xs transition-all duration-100 hover:text-[#52b2f9] ${
                activeFolder == childId
                  ? `bg-secondary border-l-4 border-l-[#52b2f9]`
                  : ""
              }`}
              onClick={() => {
                setActiveFolder(childId);
                handleArrowState(childId);
                if (!folderHiearchy.byFolderId[childId]?.childrenLoaded) {
                  LoadChildren(childId);
                }
              }}
            >
              <div
                className={`min-w-4 transform transition-transform duration-300 ${
                  folderHiearchy.byFolderId[childId]?.isExpanded
                    ? "rotate-90"
                    : ""
                }`}
              >
                <ChevronRight className="h-3 w-3" />
              </div>
              <p className="truncate overflow-hidden text-ellipsis">
                {folderHiearchy.byFolderId[childId]?.name}
              </p>
            </div>
            {folderHiearchy.byFolderId[childId]?.isExpanded &&
              folderHiearchy.byFolderId[childId]?.childrenLoaded &&
              showChildren(childId)}
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (rootFolder?.id && Auth?.userId) {
      LoadChildren(rootFolder.id);
    }
  }, [rootFolder?.id, Auth?.userId, LoadChildren]);
  if (loadingFolders) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-[15%] flex-col gap-2 border-r p-6">
          <div className="mt-4 flex items-center justify-center">
            <p>Loading folders...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <div className="fixed bottom-0 flex w-full justify-between gap-2 border-t p-6 md:static md:h-full md:w-[30%] md:flex-col md:justify-normal md:border-t-0 md:border-r lg:w-[25%] xl:w-[15%]">
        <AlertDialog
          open={newFolderDialogOpen}
          onOpenChange={setNewFolderDialogOpen}
        >
          <AlertDialogTrigger asChild className="text-xs">
            {breakpoint == "md" ? (
              <button className="bg-secondary flex w-full cursor-pointer items-center gap-3 rounded-sm border p-2 text-sm hover:border-[#2d6090] hover:bg-[#1f3c56] hover:text-[#52b2f9]">
                <FolderPlus className="h-4 w-4" />
                <p>New Folder</p>
              </button>
            ) : (
              <FolderPlus className="h-6 w-6" />
            )}
          </AlertDialogTrigger>
          <AddFolder
            onClose={() => setNewFolderDialogOpen(false)}
            id={activeFolder}
            setFolderHiearchy={setFolderHiearchy}
            LoadChildren={LoadChildren}
            showChildren={showChildren}
          />
        </AlertDialog>
        <AlertDialog open={FileDialogOpen} onOpenChange={setFileDialogOpen}>
          <AlertDialogTrigger asChild className="text-xs">
            {breakpoint == "md" ? (
              <button className="bg-secondary flex w-full cursor-pointer items-center gap-3 rounded-sm border p-2 text-sm hover:border-[#2d6090] hover:bg-[#1f3c56] hover:text-[#52b2f9]">
                <FilePlus className="h-4 w-4" />
                <p>New File</p>
              </button>
            ) : (
              <FilePlus className="h-6 w-6" />
            )}
          </AlertDialogTrigger>
          <AddFile
            onClose={() => setFileDialogOpen(false)}
            id={activeFolder}
            setFolderHiearchy={setFolderHiearchy}
            LoadChildren={LoadChildren}
            showChildren={showChildren}
          />
        </AlertDialog>
        {activeFolder != rootFolder.id ? (
          <AlertDialog
            open={deleteFolderDialogOpen}
            onOpenChange={setDeleteFolderDialogOpen}
          >
            <AlertDialogTrigger asChild className="text-xs">
              {breakpoint == "md" ? (
                <button className="bg-secondary flex w-full cursor-pointer items-center gap-3 rounded-sm border p-2 text-sm hover:border-[#2d6090] hover:bg-[#1f3c56] hover:text-[#52b2f9]">
                  <Trash2 className="h-4 w-4" />
                  <p>Delete Folder</p>
                </button>
              ) : (
                <Trash2 className="h-6 w-6" />
              )}
            </AlertDialogTrigger>
            <DeleteFolder
              onClose={() => setDeleteFolderDialogOpen(false)}
              activeFolder={activeFolder}
              userId={Auth.userId}
              setFolderHiearchy={setFolderHiearchy}
              setActiveFolder={setActiveFolder}
            />
          </AlertDialog>
        ) : (
          ""
        )}
        {breakpoint == "md" ? (
          <div className="w-full max-w-full flex-col">
            <div
              className={`mt-4 flex w-full max-w-full cursor-pointer items-center gap-3 p-2 text-xs transition-all duration-100 ${
                activeFolder == rootFolder.id
                  ? `bg-secondary border-l-5 border-l-[#52b2f9]`
                  : ""
              }`}
              onClick={() => {
                handleArrowState(rootFolder.id);
                setActiveFolder(rootFolder.id);
              }}
            >
              <div
                className={`max-w-full transform transition-transform duration-300 ${
                  folderHiearchy.byFolderId[rootFolder.id].isExpanded
                    ? "rotate-90"
                    : ""
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </div>
              <p className="hover:text-[#52b2f9]">{rootFolder.name}</p>
            </div>
            {folderHiearchy.byFolderId[rootFolder.id].isExpanded
              ? showChildren(rootFolder.id)
              : ""}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="p-6 md:w-[70%] lg:w-[75%] xl:w-[85%]">
        <p className="text-sm text-[#52b2f9]">
          {folderHiearchy.byFolderId[activeFolder].Path.split(" > ").map(
            (id, index, array) => (
              <React.Fragment key={index}>
                <span
                  className="hover:text-primary cursor-pointer text-[#52b2f9]"
                  onClick={() => {
                    setActiveFolder(id);
                    if (!folderHiearchy.byFolderId[id]?.childrenLoaded) {
                      LoadChildren(id);
                    }
                  }}
                >
                  {folderHiearchy.byFolderId[id].name}
                </span>
                {index < array.length - 1 && (
                  <span className="text-primary"> &gt; </span>
                )}
              </React.Fragment>
            ),
          )}
        </p>
        <div className="mt-2 flex w-full items-center text-sm">
          <div className="hover:bg-secondary w-[60%] cursor-pointer rounded-sm p-3">
            Name
          </div>
          <div className="hover:bg-secondary w-[20%] cursor-pointer rounded-sm p-3">
            Size
          </div>
          <div className="hover:bg-secondary w-[20%] cursor-pointer rounded-sm p-3">
            Created
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-xs">
          {folderHiearchy.byFolderId[activeFolder].childIds.map((folderId) => (
            <div
              className="bg-secondary flex w-full cursor-pointer rounded-sm border hover:border-[#2d6090] hover:bg-[#1f3c56] hover:text-[#52b2f9]"
              key={folderId}
              onClick={() => {
                setActiveFolder(folderId);
                handleArrowState(folderId);
                if (!folderHiearchy.byFolderId[folderId]?.childrenLoaded) {
                  LoadChildren(folderId);
                }
              }}
            >
              <div className="flex w-[60%] gap-2 overflow-hidden p-3">
                <Folder className="h-4 w-4" />
                <p>{folderHiearchy.byFolderId[folderId].name}</p>
              </div>
              <div className="w-[20%] p-3">
                <p>--</p>
              </div>
              <div className="w-[20%] p-3">
                <p>
                  {formatDate(folderHiearchy.byFolderId[folderId].createdTime)}
                </p>
              </div>
            </div>
          ))}
          {folderHiearchy.byFolderId[activeFolder].fileChildIds.map(
            (fileId) => (
              <div
                className="bg-secondary flex w-full cursor-pointer rounded-sm border hover:border-[#2d6090] hover:bg-[#1f3c56] hover:text-[#52b2f9]"
                key={fileId}
                onClick={() => handleOpenedState(fileId)}
              >
                <div className="flex w-[60%] gap-2 overflow-hidden p-3">
                  <File className="h-4 w-4" />
                  <p>{folderHiearchy.byFileId[fileId].name}</p>
                </div>
                <div className="w-[20%] p-3">
                  <p>{folderHiearchy.byFileId[fileId].size}</p>
                </div>
                <div className="w-[20%] p-3">
                  <p>
                    {formatDate(folderHiearchy.byFileId[fileId].createdTime)}
                  </p>
                </div>
                {folderHiearchy.byFileId[fileId].Opened &&
                  handleFileDetails(fileId)}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
