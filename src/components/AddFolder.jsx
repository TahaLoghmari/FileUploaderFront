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
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
});

export default function AddFolder({ id, onClose, setFolderHiearchy }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const { Auth } = useContext(States);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const onSubmit = async (data) => {
    setLoading(true);
    fetch(
      `${API_BASE_URL}/user/${Auth.userId}/Folders/addFolder${
        id ? `/${id}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          Name: data.name,
        }),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error Occured while Creating the folder");
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
          return newState;
        });
        console.log(data);
        onClose();
      })
      .catch((error) => console.log(error));
  };
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
          <p className="text-lg font-medium">Creating folder...</p>
        </div>
      </div>
    );
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>New Folder</AlertDialogTitle>
      </AlertDialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Folder name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </AlertDialogContent>
  );
}
