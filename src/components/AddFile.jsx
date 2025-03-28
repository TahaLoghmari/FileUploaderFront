import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext, useState } from "react";
import { States } from "../App";
import { API_BASE_URL } from "../lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: "Please select a file.",
    })
    .transform((files) => files[0]),
});

export default function AddFile({
  id,
  onClose,
  setFolderHiearchy,
  LoadChildren,
  showChildren,
}) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const { Auth } = useContext(States);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    setLoading(true);
    fetch(`${API_BASE_URL}/user/${Auth.userId}/Folders/Files/addFile/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: formData,
    })
      .then((res) => {
        setLoading(false);
        if (!res.ok) throw new Error("Error Occured while Uploading the File");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        setFolderHiearchy((prevState) => {
          const newState = { ...prevState };
          newState.byFolderId[id] = {
            ...newState.byFolderId[id],
            childrenLoaded: false,
          };
          LoadChildren(id);
          showChildren(id);
          return newState;
        });
        console.log(data);
        onClose();
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-card rounded-lg p-6 text-center shadow-lg">
          <div className="border-primary mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-lg font-medium">Uploading File...</p>
        </div>
      </div>
    );
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>New File</AlertDialogTitle>
      </AlertDialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              const { onChange, name, ref } = field;

              return (
                <FormItem>
                  <FormLabel>Select File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      ref={ref}
                      name={name}
                      onChange={(e) => {
                        onChange(e.target.files);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </Form>
    </AlertDialogContent>
  );
}
