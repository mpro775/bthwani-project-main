import { useEffect, useState } from "react";
import {
  deleteHomeLayout,
  listHomeLayouts,
  upsertHomeLayout,
  type HomeLayout,
} from "../../api/cmsApi";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Save } from "@mui/icons-material";

export default function HomeLayoutAdmin() {
  const [doc, setDoc] = useState<HomeLayout | null>(null);
  const [all, setAll] = useState<HomeLayout[]>([]);
  console.log(all);
  async function load() {
    const arr = await listHomeLayouts();
    setAll(arr);
    setDoc(arr?.[0] || { sections: [], channel: "app", active: true });
  }
  useEffect(() => {
    load();
  }, []);

  function addSection() {
    if (!doc) return;
    setDoc({
      ...doc,
      sections: [...doc.sections, { key: "trending", enabled: true, limit: 8 }],
    });
  }
  function removeSection(idx: number) {
    if (!doc) return;
    const sections = [...doc.sections];
    sections.splice(idx, 1);
    setDoc({ ...doc, sections });
  }
  async function save() {
    if (!doc) return;
    if (doc._id) await upsertHomeLayout(doc);
    else await upsertHomeLayout(doc);
    await load();
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Home Layout</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Add />}
            onClick={() =>
              setDoc({ sections: [], channel: "app", active: true })
            }
          >
            جديد
          </Button>
          {doc?._id && (
            <Button
              color="error"
              startIcon={<Delete />}
              onClick={async () => {
                if (confirm("حذف المخطط الحالي؟")) {
                  await deleteHomeLayout(doc._id!);
                  load();
                }
              }}
            >
              حذف
            </Button>
          )}
          <Button variant="contained" startIcon={<Save />} onClick={save}>
            حفظ
          </Button>
        </Stack>
      </Stack>

      {doc && (
        <Card>
          <CardHeader title="الخصائص العامة" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Channel"
                  value={doc.channel || "app"}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      channel: e.target.value as HomeLayout["channel"],
                    })
                  }
                >
                  <MenuItem value="app">app</MenuItem>
                  <MenuItem value="web">web</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={doc.city || ""}
                  onChange={(e) => setDoc({ ...doc, city: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Order"
                  value={doc.order || 0}
                  onChange={(e) =>
                    setDoc({ ...doc, order: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} mt={1.5}>
                  <Typography>Active</Typography>
                  <Switch
                    checked={!!doc.active}
                    onChange={(_, b) => setDoc({ ...doc, active: b })}
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>

          <CardHeader
            title="الأقسام"
            action={
              <Button startIcon={<Add />} onClick={addSection}>
                إضافة قسم
              </Button>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              {doc.sections.map((s, i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          select
                          fullWidth
                          label="Key"
                          value={s.key}
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              sections: doc.sections.map((x, idx) =>
                                idx === i ? { ...x, key: e.target.value } : x
                              ),
                            })
                          }
                        >
                          <MenuItem value="offers_only">offers_only</MenuItem>
                          <MenuItem value="trending">trending</MenuItem>
                          <MenuItem value="categories">categories</MenuItem>
                          <MenuItem value="stores_nearby">
                            stores_nearby
                          </MenuItem>
                          <MenuItem value="banners">banners</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mt={1.5}
                        >
                          <Typography>Enabled</Typography>
                          <Switch
                            checked={!!s.enabled}
                            onChange={(_, b) =>
                              setDoc({
                                ...doc,
                                sections: doc.sections.map((x, idx) =>
                                  idx === i ? { ...x, enabled: b } : x
                                ),
                              })
                            }
                          />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          type="number"
                          fullWidth
                          label="Limit"
                          value={s.limit || 0}
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              sections: doc.sections.map((x, idx) =>
                                idx === i
                                  ? { ...x, limit: Number(e.target.value) }
                                  : x
                              ),
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Title (ar)"
                          value={s.title?.ar || ""}
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              sections: doc.sections.map((x, idx) =>
                                idx === i
                                  ? {
                                      ...x,
                                      title: { ...x.title, ar: e.target.value },
                                    }
                                  : x
                              ),
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Title (en)"
                          value={s.title?.en || ""}
                          onChange={(e) =>
                            setDoc({
                              ...doc,
                              sections: doc.sections.map((x, idx) =>
                                idx === i
                                  ? {
                                      ...x,
                                      title: { ...x.title, en: e.target.value },
                                    }
                                  : x
                              ),
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 1 }}>
                        <IconButton
                          color="error"
                          onClick={() => removeSection(i)}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
